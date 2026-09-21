# Generative models: VAE, diffusion, and flow matching

Written by Codex

How do we turn samples from an unknown distribution into a model that generates new samples? VAEs, diffusion models, and flow matching share this goal. Their connections become clearer if we follow the mathematical obstacles: an intractable likelihood, a difficult reverse process, and an unknown transport field.

This note follows one route through those ideas. It is a derivation path, not a claim that each method replaced the previous one. The companion [Flow matching](../post.html?slug=flow-matching) note develops the transport construction in more detail.

- **VAE** — Bound a latent-variable likelihood.

- **Diffusion** — Apply the bound to a noising hierarchy.

- **Flow matching** — Learn motion along a probability path.

## The big picture: three ways to generate a sample

All three start from an easy source of randomness. The diagrams below compare a standard single-latent VAE, a DDPM, and an ODE trained with flow matching. These are representative constructions; the number of network evaluations is not what defines the model family.

**VAE** — Decode a latent code

**Prior code** ($z\sim p(z)$) → **Decoder** ($p_\theta(x\mid z)$) → **Sample** ($x$)

One decoder evaluation for a standard feedforward decoder, then sample its output distribution. The encoder is used during training.

**Diffusion · DDPM** — Repeatedly denoise

**Noise** ($x_T$) → **Reverse step** ($x_{T-1}$) → ⋯ → **Reverse step** ($x_1$) → **Sample** ($x_0$)

A time-conditioned network is reused across reverse steps. Standard DDPM sampling includes random transitions; diffusion also supports deterministic samplers.

**Flow matching** — Integrate a learned velocity

**Noise** ($Z_0$) → **ODE solver** ($\dot Z_s=v_\theta(Z_s,s)$) → **Sample** ($Z_1$)

The solver generally evaluates the velocity network many times. The ODE trajectory is deterministic once the initial noise is drawn.

Generation runs from noise to data in every row. Diffusion indices decrease; flow time increases. A single ODE-solver box still contains multiple numerical steps.

### Is a VAE a one-step diffusion model?

**The useful connection is “diffusion as a structured hierarchical VAE.”** A standard VAE learns an encoder $q_\phi(z\mid x)$ and a decoder. A DDPM uses a prescribed Gaussian noising chain as its encoder and learns reverse transitions. Both admit the same variational-bound construction. See [VAE](https://arxiv.org/abs/1312.6114), [DDPM](https://arxiv.org/html/2006.11239v2), and [Variational Diffusion Models](https://arxiv.org/abs/2107.00630).

$$
\begin{aligned}
\text{One latent:}\quad &p_\theta(x,z)=p(z)p_\theta(x\mid z),\\
\text{Latent hierarchy:}\quad &p_\theta(x_{0:T})=p(x_T)\prod_{k=1}^{T}p_\theta(x_{k-1}\mid x_k).
\end{aligned}
$$

Setting $T=1$ in the second construction gives a one-latent model and a VAE-form bound. But its noising encoder is still constrained; a general VAE learns its representation, which can have a different dimension from the data. **“One decoder pass” describes computation, not equivalence to a diffusion model.**

Why introduce many noise levels? If a single corruption step removes almost all information, reversing it requires modeling nearly the entire data distribution at once. Small corruption steps make local reverse transitions easier to approximate. Simply deleting a trained diffusion model's intermediate steps does not make it a VAE.

### Where does the training signal come from?

**VAE** — Learn the latent representation

**Data** ($x$) → **Learned encoder** ($q_\phi(z\mid x)$) → **Latent sample** ($z$)

**Supervision:** decode $z$, score the original $x$ under the decoder likelihood, and penalize encoder–prior KL. Train encoder and decoder jointly.

**Diffusion · noise prediction** — Choose a noise level

**Data + noise** ($x_0,\epsilon,k$) → **Fixed corruption** (Gaussian noising) → **Noisy input** ($x_k$)

**Supervision:** give $(x_k,k)$ to the network and regress its noise prediction onto the known $\epsilon$. Sampling one noise level suffices for a training example.

**Flow matching · linear path** — Choose a point along a path

**Data + noise** ($X,\epsilon,s$) → **Interpolation** ($(1-s)\epsilon+sX$) → **Path input** ($Y_s$)

**Supervision:** give $(Y_s,s)$ to the network and regress its velocity onto the known derivative $X-\epsilon$. No ODE solve is needed to construct this training example.

The training construction supplies information that is unavailable when generating a new sample: a known data example, and for the last two rows, its sampled noise.

**The diffusion–flow-matching bridge is score ↔ velocity.** For compatible Gaussian probability paths, the exact score can be converted into the corresponding transport velocity. Diffusion can therefore generate with a probability flow ODE; flow matching trains a velocity field directly and permits other paths. “Random versus deterministic” does not cleanly separate the families. The [score-SDE paper](https://arxiv.org/abs/2011.13456) and [flow-matching paper](https://arxiv.org/abs/2210.02747) develop this connection; [Section 10](#shared-field) derives the conversion and its conditions.

## 1. Model the data distribution

Let $\mathcal D=\{x_i\}_{i=1}^N$ contain independent samples from $p_{\mathrm{data}}$, with $x_i\in\mathbb R^d$. We want a normalized model $p_\theta$ that assigns probability where the data occur and can generate new examples. Maximum likelihood gives a starting objective:

$$
\min_\theta\mathcal L_{\mathrm{NLL}}(\theta),\qquad
\mathcal L_{\mathrm{NLL}}=-\frac1N\sum_{i=1}^N\log p_\theta(x_i).
$$

At the population level, minimizing $-\mathbb E_{p_{\mathrm{data}}}\log p_\theta(X)$ is equivalent to minimizing $D_{\mathrm{KL}}(p_{\mathrm{data}}\|p_\theta)$, whenever these quantities are well defined: their difference is the data entropy, which does not depend on $\theta$. We need samples to estimate this expectation, but we still need a way to evaluate or bound the model likelihood.

## 2. A latent variable makes sampling easy, but likelihood hard

Introduce a random variable $z$ and a decoder distribution:

$$
z\sim p(z),\qquad x\sim p_\theta(x\mid z),\qquad
p_\theta(x)=\int p(z)p_\theta(x\mid z)\,dz.
$$

The prior supplies randomness; the decoder gives it structure. A standard Gaussian is a convenient prior, not an assumption that the data are Gaussian. In a VAE, $z$ may have fewer dimensions than $x$, and the decoder is a conditional distribution rather than an invertible map.

Sampling takes two steps. Likelihood evaluation must sum over every latent explanation of an observed $x$. A nonlinear decoder usually makes that integral intractable. The posterior $p_\theta(z\mid x)=p(z)p_\theta(x\mid z)/p_\theta(x)$ contains the same unknown denominator.

## 3. Derive the VAE objective

Introduce an encoder $q_\phi(z\mid x)$ to approximate the posterior. Multiply and divide the integrand by this density, then apply Jensen's inequality to the concave logarithm:

$$
\begin{aligned}
\log p_\theta(x)
&=\log\mathbb E_{q_\phi(z\mid x)}\!\left[\frac{p_\theta(x,z)}{q_\phi(z\mid x)}\right]\\
&\ge\mathbb E_{q_\phi(z\mid x)}\!\left[\log\frac{p_\theta(x,z)}{q_\phi(z\mid x)}\right]\\
&=\underbrace{\mathbb E_q\log p_\theta(x\mid z)
-D_{\mathrm{KL}}\!\left(q_\phi(z\mid x)\|p(z)\right)}_{\mathrm{ELBO}(x)}.
\end{aligned}
$$

The *evidence lower bound* balances reconstruction likelihood against the cost of using latent codes that differ from the prior. Its exact gap is

$$
\log p_\theta(x)-\mathrm{ELBO}(x)
=D_{\mathrm{KL}}\!\left(q_\phi(z\mid x)\|p_\theta(z\mid x)\right)\ge0.
$$

We maximize the bound jointly over $\theta$ and $\phi$. The encoder makes training tractable; generation uses the prior and decoder. A better posterior approximation tightens the bound. This is the central construction of [Auto-Encoding Variational Bayes](https://arxiv.org/abs/1312.6114).

### Turn sampling into a differentiable computation

For a diagonal Gaussian encoder, write the sample in terms of parameter-free noise:

$$
q_\phi(z\mid x)=\mathcal N(\mu_\phi(x),\operatorname{diag}\sigma_\phi^2(x)),
\qquad z=\mu_\phi(x)+\sigma_\phi(x)\odot\epsilon,\quad\epsilon\sim\mathcal N(0,I).
$$

For a fixed draw of $\epsilon$, gradients flow through $z$ into the encoder. If $p_\theta(x\mid z)=\mathcal N(g_\theta(z),\sigma_x^2I)$ with fixed variance, its negative log-likelihood is $\|x-g_\theta(z)\|^2/(2\sigma_x^2)$ plus a constant. This explains where a reconstruction MSE comes from; it depends on the decoder likelihood. [Stochastic backpropagation](https://arxiv.org/abs/1401.4082) independently developed this route to training deep latent-variable models.

## 4. Replace one latent variable with a noising hierarchy

A single decoder must turn a latent code into a complete example. Consider instead a sequence of latent variables $x_1,\ldots,x_T$, with $x_0=x$ the observed data. The generative model starts at noise and makes a sequence of refinements:

$$
p_\theta(x_{0:T})=p(x_T)\prod_{k=1}^T p_\theta(x_{k-1}\mid x_k),
\qquad x_T\longrightarrow x_{T-1}\longrightarrow\cdots\longrightarrow x_0.
$$

We can apply the same variational argument using the entire chain as the latent variable. Diffusion makes a specific choice for the encoder: a simple, usually fixed process that gradually destroys information.

$$
\begin{aligned}
q(x_{1:T}\mid x_0)&=\prod_{k=1}^Tq(x_k\mid x_{k-1}),\\
q(x_k\mid x_{k-1})&=\mathcal N(\sqrt{\alpha_k}\,x_{k-1},\beta_k I),
\qquad\alpha_k=1-\beta_k.
\end{aligned}
$$

Each step scales the signal and adds independent Gaussian noise. Let $\bar\alpha_k=\prod_{j=1}^k\alpha_j$. Composing Gaussian transitions gives a direct sample at any level:

$$
x_k=\sqrt{\bar\alpha_k}\,x_0+\sqrt{1-\bar\alpha_k}\,\epsilon,
\qquad\epsilon\sim\mathcal N(0,I).
$$

When $\bar\alpha_T$ is close to zero, the terminal distribution is close to a standard Gaussian. It need not be exactly Gaussian at finite $T$. Training can draw one $k$ and construct $x_k$ directly, without running all the preceding steps.

**This is the first connection:** a DDPM can be viewed as a structured hierarchical VAE with a prescribed Gaussian encoder and a learned reverse decoder. Its noisy latents normally retain the data dimension. This perspective is made explicit in [Variational Diffusion Models](https://arxiv.org/abs/2107.00630).

## 5. The same bound becomes a sequence of denoising problems

Substitute the two chains into the negative ELBO:

$$
\mathcal L_{\mathrm{VLB}}(x_0)
=\mathbb E_{q(x_{1:T}\mid x_0)}\!\left[
\log\frac{q(x_{1:T}\mid x_0)}{p_\theta(x_{0:T})}\right]
\ge-\log p_\theta(x_0).
$$

Factor the encoder chain backward, conditioned on the known training example $x_0$. The log-ratio separates into three kinds of terms:

$$
\begin{aligned}
\mathcal L_{\mathrm{VLB}}(x_0)
&=\underbrace{D_{\mathrm{KL}}(q(x_T\mid x_0)\|p(x_T))}_{\text{terminal prior match}}\\
&\quad+\sum_{k=2}^T\mathbb E_{q(x_k\mid x_0)}
\underbrace{D_{\mathrm{KL}}\!\left(q(x_{k-1}\mid x_k,x_0)\|p_\theta(x_{k-1}\mid x_k)\right)}_{\text{learn a reverse step}}\\
&\quad-\underbrace{\mathbb E_{q(x_1\mid x_0)}\log p_\theta(x_0\mid x_1)}_{\text{final reconstruction}}.
\end{aligned}
$$

The prior term is constant with respect to the reverse model when the noise schedule is fixed. The middle terms teach the reverse transitions. Their target $q(x_{k-1}\mid x_k,x_0)$ is analytically Gaussian because the clean example is known during training. The reverse conditional without $x_0$ generally is not Gaussian; the model learns a Gaussian approximation to each small step.

**Where did the decomposition come from?**

Bayes' rule along the fixed forward chain gives

$$
q(x_{1:T}\mid x_0)
=q(x_T\mid x_0)\prod_{k=2}^Tq(x_{k-1}\mid x_k,x_0).
$$

Divide this by the generative joint. The terminal ratio gives the prior KL, each intermediate ratio gives a reverse-step KL, and the unmatched decoder factor $p_\theta(x_0\mid x_1)$ gives reconstruction. No new variational principle is needed.

## 6. Gaussian reverse steps lead to noise prediction

Choose $p_\theta(x_{k-1}\mid x_k)=\mathcal N(\mu_\theta(x_k,k),\sigma_k^2I)$, with fixed variance. For $k\ge2$, each reverse-step KL depends on the network through a squared mean error:

$$
D_{\mathrm{KL}}(q\|p_\theta)
=\frac{\|\widetilde\mu_k(x_k,x_0)-\mu_\theta(x_k,k)\|^2}{2\sigma_k^2}
+C_k,
$$

Here $C_k$ is independent of $\theta$. Express the known posterior mean in terms of the sampled noise, and give the model the same form:

$$
\begin{aligned}
\widetilde\mu_k&=\frac1{\sqrt{\alpha_k}}
\left(x_k-\frac{\beta_k}{\sqrt{1-\bar\alpha_k}}\epsilon\right),\\
\mu_\theta(x_k,k)&=\frac1{\sqrt{\alpha_k}}
\left(x_k-\frac{\beta_k}{\sqrt{1-\bar\alpha_k}}\epsilon_\theta(x_k,k)\right).
\end{aligned}
$$

**Derive the Gaussian posterior mean**

For $k\ge2$, multiply $q(x_k\mid x_{k-1})$ by $q(x_{k-1}\mid x_0)$ and complete the square in $x_{k-1}$. The posterior variance and mean are

$$
\begin{aligned}
\widetilde\beta_k&=\frac{\beta_k(1-\bar\alpha_{k-1})}{1-\bar\alpha_k},\\
\widetilde\mu_k&=\widetilde\beta_k\left(
\frac{\sqrt{\alpha_k}}{\beta_k}x_k+
\frac{\sqrt{\bar\alpha_{k-1}}}{1-\bar\alpha_{k-1}}x_0\right).
\end{aligned}
$$

Substitute $x_0=(x_k-\sqrt{1-\bar\alpha_k}\,\epsilon)/\sqrt{\bar\alpha_k}$ and use $\bar\alpha_k=\alpha_k\bar\alpha_{k-1}$. Collecting the coefficients of $x_k$ and $\epsilon$ yields the mean above.

Subtract the two lines and square. The network-dependent term becomes

$$
\frac{\beta_k^2}{2\sigma_k^2\alpha_k(1-\bar\alpha_k)}
\|\epsilon-\epsilon_\theta(x_k,k)\|^2.
$$

Thus noise prediction follows from the variational bound and a Gaussian reverse model. [DDPM](https://arxiv.org/abs/2006.11239) popularized the simpler objective

$$
\mathcal L_{\mathrm{simple}}
=\mathbb E_{x_0,\epsilon,k}\|\epsilon-\epsilon_\theta(x_k,k)\|^2,
\qquad k\sim\mathcal U\{1,\ldots,T\}.
$$

**The weighting changed.** This simple MSE is not literally the original negative ELBO: it drops the time-dependent weights above, and the reconstruction endpoint needs separate treatment for exact likelihoods. The network also cannot recover the particular noise draw from every ambiguous $x_k$. At the population MSE optimum it predicts $\mathbb E[\epsilon\mid x_k,k]$.

## 7. Noise prediction is also score estimation

To see the next connection, fix a noise level and write $Y=aX+b\epsilon$, with $X\sim p_{\mathrm{data}}$, independent $\epsilon\sim\mathcal N(0,I)$, and $b>0$. Its conditional density is Gaussian, so

$$
\nabla_y\log p(y\mid X)
=-\frac{y-aX}{b^2}=-\frac{\epsilon}{b}.
$$

The *score* is the gradient of the log-density with respect to its input. Differentiate the marginal density under the integral and divide by that density:

$$
\begin{aligned}
r(y):=\nabla_y\log p(y)
&=\int\nabla_y\log p(y\mid X)\,p(X\mid Y=y)\,dX\\
&=-\frac1b\mathbb E[\epsilon\mid Y=y].
\end{aligned}
$$

Therefore the optimal noise predictor gives the marginal score after multiplication by $-1/b$. We never needed to evaluate the unknown data density. Noise prediction and denoising score matching fit related targets; their losses differ by a factor of $b^2$ at each noise level. [Noise-conditioned score networks](https://arxiv.org/abs/1907.05600) developed a parallel route to generative modeling through these density gradients.

## 8. A score defines a deterministic probability flow

A diffusion process has random trajectories. Does generation require random perturbations at every step? Consider its continuous-time noising limit

$$
dX_t=f(X_t,t)\,dt+g(t)\,dW_t,\qquad X_0\sim p_{\mathrm{data}},
$$

where $W_t$ is standard Brownian motion and $g(t)$ is a scalar noise amplitude. Let $q_t$ be the density of $X_t$. Its Fokker–Planck equation can be rewritten using $\nabla q_t=q_t\nabla\log q_t$:

$$
\begin{aligned}
\partial_t q_t
&=-\nabla\cdot(fq_t)+\tfrac12g(t)^2\Delta q_t\\
&=-\nabla\cdot\!\left[q_t\left(f-\tfrac12g(t)^2\nabla\log q_t\right)\right].
\end{aligned}
$$

This has the form of probability conservation under a deterministic velocity. The corresponding *probability flow ODE* is

$$
\frac{dZ_t}{dt}=f(Z_t,t)-\tfrac12g(t)^2r_t(Z_t),
\qquad r_t=\nabla\log q_t.
$$

Under suitable regularity, the exact score gives the same time-marginal distributions as the SDE, although individual paths differ. Generate by starting at its terminal noise distribution and integrating backward. A learned score and a finite solver introduce errors. This bridge was established in [score-based generative modeling through SDEs](https://arxiv.org/abs/2011.13456).

**Velocity has now appeared:** it is a way of moving probability through space. It combines the drift and the score; it is not simply the direction of increasing density.

## 9. Learn the velocity directly

Switch to generation time $s\in[0,1]$: zero is noise and one is data. The earlier $k$ and $t$ ran in the opposite direction. Choose differentiable schedules and construct a path from independent endpoints:

$$
\begin{aligned}
Y_s&=a_sX+b_s\epsilon,\qquad p_s=\operatorname{Law}(Y_s),\\
(a_0,b_0)&=(0,1),\qquad(a_1,b_1)=(1,0),\\
\dot Y_s&=a_s'X+b_s'\epsilon.
\end{aligned}
$$

We know the derivative of every constructed path. A network sees only the intermediate point and time, so regress onto that derivative:

$$
\mathcal L_{\mathrm{CFM}}(\theta)
=\mathbb E_{s,X,\epsilon}\left\|v_\theta(Y_s,s)-(a_s'X+b_s'\epsilon)\right\|^2.
$$

Here $s$ is sampled uniformly, and the schedules are fixed independently of $\theta$. Conditional expectation gives the population minimizer:

$$
u_s(y)=\mathbb E[a_s'X+b_s'\epsilon\mid Y_s=y].
$$

Each constructed path moves probability; averaging the conditional flux yields $\partial_s p_s+\nabla\cdot(p_su_s)=0$. Thus the ODE $dZ_s/ds=u_s(Z_s)$ generates the same marginals under the usual existence and uniqueness assumptions. It need not follow the individual training paths.

For $a_s=s$ and $b_s=1-s$, the label becomes $X-\epsilon$:

$$
\mathcal L_{\mathrm{CFM}}(\theta)
=\mathbb E\left\|v_\theta((1-s)\epsilon+sX,s)-(X-\epsilon)\right\|^2.
$$

This is the straight-path construction shared with [rectified flow](https://arxiv.org/abs/2209.03003). [Flow matching](https://arxiv.org/abs/2210.02747) allows a broader choice of probability paths, including diffusion paths. Training samples one point on a known path; generation integrates the learned ODE. This is a velocity-regression objective, not another application of the VAE bound.

## 10. Derive the score–velocity connection explicitly

For the same Gaussian path, define $r_s(y)=\nabla_y\log p_s(y)$. At interior times with $a_s,b_s>0$, the score identity and the conditional mean of $Y_s$ give

$$
\begin{aligned}
\mathbb E[\epsilon\mid Y_s=y]&=-b_s r_s(y),\\
\mathbb E[X\mid Y_s=y]&=\frac{y+b_s^2r_s(y)}{a_s}.
\end{aligned}
$$

Substitute both expressions into $u_s=a_s'\mathbb E[X\mid Y_s]+b_s'\mathbb E[\epsilon\mid Y_s]$:

$$
\boxed{u_s(y)=\frac{a_s'}{a_s}y+
\left(\frac{a_s'}{a_s}b_s^2-b_sb_s'\right)r_s(y).}
$$

**For a fixed Gaussian path, the score and its conditional-mean velocity encode the same information whenever the score coefficient is nonzero.** Conversion factors and endpoint limits matter. Choosing a different path changes the field.

[Interactive figure: Explore the exact score and velocity of a two-mode probability path](../figures/generative-models.html)

  Two-mode toy data: $\tfrac12\mathcal N(-2,0.45^2)+\tfrac12\mathcal N(2,0.45^2)$. Change the schedule, time, or probe position. The solid velocity comes from conditional endpoint averages; the dashed velocity comes from the score formula. They coincide. These are analytic fields, not trained networks. The slider stays away from singular conversion endpoints.

**How does this recover the diffusion probability flow ODE?**

Take a linear noising drift $f(x,t)=c(t)x$, normalize its time interval to $[0,1]$, and reverse time with $s=1-t$. The reversed Gaussian schedules satisfy $a_s'/a_s=-c(t)$ and $b_sb_s'=-c(t)b_s^2-g(t)^2/2$. Substitution gives

$$
u_s(y)=-c(t)y+\tfrac12g(t)^2r_s(y),\qquad t=1-s.
$$

This is exactly the previous probability flow ODE with its time direction reversed. Matching a diffusion path's velocity and converting its exact score give the same field. For finite noise horizons, the initial law is the terminal noised-data law, commonly approximated by a Gaussian.

### Equivalent predictions do not imply identical losses

For the linear path, let $e_\theta(y,s)$ predict noise, and define $v_\theta(y,s)=(y-e_\theta(y,s))/s$. On a training pair, $Y_s=sX+(1-s)\epsilon$, so

$$
\begin{aligned}
u_s(y)&=\frac{y+(1-s)r_s(y)}s,\\
\|v_\theta(Y_s,s)-(X-\epsilon)\|^2
&=\frac1{s^2}\|e_\theta(Y_s,s)-\epsilon\|^2.
\end{aligned}
$$

The correspondence is exact for this parameter conversion, but uniform velocity MSE becomes a weighted noise MSE. With shared finite-capacity networks, weighting, schedule, architecture, and solver can all affect the result. Also, a diffusion model's so-called *v-prediction* is a schedule-dependent parameterization; its symbol alone does not make it the same as $dY_s/ds$.

## 11. How the ideas developed

The chronology has overlapping lines of work. Dates below refer to the first preprints or initial publication years, not a ranking of models.

- **2013–2014 — trainable latent-variable inference.** [Kingma and Welling](https://arxiv.org/abs/1312.6114) and [Rezende, Mohamed, and Wierstra](https://arxiv.org/abs/1401.4082) develop scalable variational learning with reparameterized gradients.

- **2015 — diffusion probabilistic models.** [Sohl-Dickstein and colleagues](https://arxiv.org/abs/1503.03585) introduce gradual noising and a learned reverse process, trained through a variational bound.

- **2018–2019 — continuous flows and score models.** [Neural ODEs](https://arxiv.org/abs/1806.07366) provide continuous normalizing flows; [Song and Ermon](https://arxiv.org/abs/1907.05600) learn scores across noise levels.

- **2020–2021 — connections become explicit.** [DDPM](https://arxiv.org/abs/2006.11239) connects diffusion training to denoising; [DDIM](https://arxiv.org/abs/2010.02502) supports deterministic sampling with the diffusion training objective; [score SDEs](https://arxiv.org/abs/2011.13456) supply a unified continuous view and probability flow ODEs; [VDM](https://arxiv.org/abs/2107.00630) develops the variational connection.

- **2022–2023 — direct training of transport fields.** The 2022 preprints on [rectified flow](https://arxiv.org/abs/2209.03003) and [flow matching](https://arxiv.org/abs/2210.02747), presented at ICLR 2023, develop regression-based routes to generative ODEs.

These methods can also be composed. [Latent diffusion](https://arxiv.org/abs/2112.10752) uses an autoencoder representation and learns a diffusion model in that space. A learned latent representation and an iterative generative process solve different parts of the problem.

## 12. What changes, and what is shared?

| Model | Training signal | Generation |
| --- | --- | --- |
| VAE | Reconstruction likelihood and latent KL; optimize an ELBO. | Sample a prior code, then the decoder distribution. |
| Diffusion | Reverse-step likelihoods, often trained as reweighted noise or score regression. | Reverse stochastic transitions or a deterministic sampler. |
| Flow matching | Regress onto conditional path derivatives. | Draw base noise and integrate a velocity field. |

The VAE–diffusion connection is a shared variational construction. The diffusion–flow-matching connection is a shared description of evolving distributions, with score and velocity related by the chosen path. Neither connection makes all their practical objectives identical. The [flow matching note](../post.html?slug=flow-matching#training-loss) expands the conditional-to-marginal regression proof and the final sampling algorithm.
