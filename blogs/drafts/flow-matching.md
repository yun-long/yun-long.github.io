# Flow matching for generative control

Written by Codex

![Whiteboard derivation of flow matching.](../../images/flow-matching-overview.jpg)

Robot controllers can be designed using control theory, trajectory optimization, imitation learning, reinforcement learning, or combinations of these approaches. These methods draw on different sources of information: models of the system dynamics, objectives and constraints, demonstrations, or rewards from interaction. In this note, we focus on imitation learning: given observations and demonstrated action chunks, how can we learn a policy that produces appropriate action sequences for a new observation?

We formulate the learning problem as modeling a data distribution $p_{\mathrm{data}}(x)$ from examples $\mathcal D=\{x_i\}_{i=1}^N$. Here $x$ represents an action chunk. To simplify the derivation, we fix the observation and leave its conditioning implicit in all distributions and vector fields below. Flow matching gives us a way to learn and sample this distribution.

## 1. What are we trying to model?

Each example $x\in\mathbb R^d$ is an action chunk, flattened into a vector. A horizon of $H$ actions with $d_u$ coordinates per action gives $d=Hd_u$. We write

$$
\mathcal D=\{x_i\}_{i=1}^N,\qquad x_i\sim p_{\mathrm{data}},\qquad p_\theta(x)\approx p_{\mathrm{data}}(x).
$$

We have examples, not an evaluable formula for the density. The goal is to learn a model that can produce new samples with the same distributional structure. The notation suppresses observation inputs; a robot policy still uses them during training and inference.

**Why a distribution?** At a fixed observation, a squared-error point predictor has the population optimum $\mathbb E[X]$. If the action distribution has separated modes, this mean can fall between valid behaviors. Sampling from a distribution can preserve those alternatives while modeling the actions within a chunk jointly.

[Interactive figure: Data samples, a Gaussian baseline, and the toy data density](../figures/flow-matching.html?view=data)

  A scalar illustration of $p_{\mathrm{data}}(x)$. Tick marks are data samples. The actual policy models an entire action chunk jointly; this plot illustrates multimodality in one dimension. Reveal the toy density to compare it with a single Gaussian.

Use a two-mode distribution as a running example:

$$
p_{\mathrm{data}}(x)=\tfrac12\mathcal N(x;-2,0.45^2)+\tfrac12\mathcal N(x;2,0.45^2).
$$

The analytic density is known only in this toy example. For real data, we must infer its structure from the samples.

## 2. Define the model through a sampler

Transform an easy random variable into a data sample:

$$
Z_0\sim p_0=\mathcal N(0,I_d),\qquad
\hat x=T_\theta(Z_0),\qquad p_\theta=(T_\theta)_\#p_0.
$$

The pushforward symbol $\#$ means: draw noise, transform it, and consider the distribution of the outputs. For any region $B$ of data space,

$$
\Pr(\hat x\in B)=\int_{\{z:T_\theta(z)\in B\}}p_0(z)\,dz.
$$

A transformation therefore defines a probability distribution without directly predicting density values. Different noise draws provide randomness among possible outputs. The remaining question is how to represent and train $T_\theta$. The [MIT flow and diffusion notes](https://arxiv.org/html/2506.02070v1#S1) develop this sampling viewpoint.

## 3. Build the transformation from small moves

A neural network $v_\theta(x,s)\in\mathbb R^d$ specifies the velocity at position $x$ and flow time $s$. Generate a sample with an ODE:

$$
\frac{dZ_s}{ds}=v_\theta(Z_s,s),\qquad Z_0\sim p_0,\qquad \hat x=Z_1.
$$

**Two different times:** $t$ indexes robot execution; $s\in[0,1]$ indexes sample generation. Every flow step refines the entire action chunk. The observation stays fixed during this solve, and the flow velocity is not itself a physical robot velocity command.

Write $q_s^\theta=\operatorname{Law}(Z_s)$. Our endpoint goal is $q_1^\theta=p_\theta\approx p_{\mathrm{data}}$. We now have a sampler, but no training target for its velocity.

## 4. Choose a distribution path we can sample

Draw a data endpoint $X_1\sim p_{\mathrm{data}}$ and independent noise $X_0\sim p_0$. Interpolate:

$$
X_s=(1-s)X_0+sX_1,\qquad p_s=\operatorname{Law}(X_s).
$$

At $s=0$, this gives the noise distribution; at $s=1$, it gives the data distribution. At any intermediate time, one noise draw and one data example produce a sample from $p_s$. No ODE solve is needed to construct these training samples.

[Interactive figure: Reference density and comparison of training interpolation with ODE paths](../figures/flow-matching.html?view=transport)

  Move flow time from 0 to 1. The upper curve is the exact toy $p_s(x)$. Below it, compare training interpolation with the ODE of the exact marginal velocity. These are paths through data space during generation, not robot trajectories through physical space. No neural network is trained in this figure.

Keep the distinction: $p_s$ is our chosen reference path; $q_s^\theta$ is what the learned ODE produces. Also, the law of interpolated samples is generally different from the density mixture $(1-s)p_0+s\,p_{\mathrm{data}}$.

## 5. A velocity target from one data endpoint

Differentiate the training path while holding both endpoints fixed:

$$
\dot X_s=X_1-X_0.
$$

This gives an immediately available velocity label. Equivalently, fix a data endpoint $X_1=x_1$. Its conditional path and velocity are

$$
\begin{aligned}
 p_s(x\mid x_1)&=\mathcal N\!\left(x;sx_1,(1-s)^2I_d\right),\\
 u_s(x\mid x_1)&=\frac{x_1-x}{1-s},\qquad 0\le s<1.
\end{aligned}
$$

Obtain the second line by solving $x=(1-s)x_0+sx_1$ for $x_0$, then substituting into $x_1-x_0$. On a sampled training path, the target is simply $x_1-X_0$, avoiding division by $1-s$.

At inference the destination $x_1$ is unknown. We need a single velocity depending on the current position and flow time, without access to that endpoint.

## 6. Combine the endpoint-conditioned velocities

Average over endpoints compatible with being at $x$ at flow time $s$. Bayes' rule gives their weights:

$$
\begin{aligned}
 p_s(x)&=\int p_s(x\mid x_1)p_{\mathrm{data}}(x_1)\,dx_1,\\
 u_s(x)&=\int u_s(x\mid x_1)\,
 \underbrace{\frac{p_s(x\mid x_1)p_{\mathrm{data}}(x_1)}{p_s(x)}}_{p(x_1\mid X_s=x)}\,dx_1\\
 &=\mathbb E[X_1-X_0\mid X_s=x].
\end{aligned}
$$

These are posterior weights, not a uniform average of all destinations. They let the field depend on the current position and preserve multiple modes.

**Why is this the correct field?** Conservation of probability requires the continuity equation:

$$
\partial_s p_s(x)+\nabla_x\cdot\big(p_s(x)u_s(x)\big)=0.
$$

Each endpoint-conditioned path satisfies this equation. Integrating over endpoints produces the probability flux $p_s(x)u_s(x)$. Under suitable smoothness and uniqueness assumptions, the averaged field therefore transports the reference distribution. This is the construction in [Flow Matching, Section 3](https://arxiv.org/html/2210.02747v2#S3).

**Expand the conservation argument**

  Assuming differentiation and integration can be exchanged:

$$
\begin{aligned}
  \partial_s p_s(x)
  &=\int \partial_s p_s(x\mid x_1)p_{\mathrm{data}}(x_1)\,dx_1\\
  &=-\nabla_x\cdot\int p_s(x\mid x_1)u_s(x\mid x_1)p_{\mathrm{data}}(x_1)\,dx_1\\
  &=-\nabla_x\cdot\big(p_s(x)u_s(x)\big).
  \end{aligned}
$$

  An ODE using $u_s$ starts from the same $p_0$ and has the same density evolution when the equation has a unique solution. It preserves the time marginals, not the training endpoint pairings.

Independent training lines can cross. ODE paths under a sufficiently regular single-valued field cannot cross at the same time. The model needs to reproduce the distributions, not each training line.

## 7. Learn the field without evaluating the average

The ideal loss regresses onto $u_s(x)$, but its posterior integral is intractable. Instead, draw $X_1\sim p_{\mathrm{data}}$, independent $X_0\sim p_0$, and $s\sim\mathcal U(0,1)$, then use the endpoint difference:

$$
\begin{aligned}
 X_s&=(1-s)X_0+sX_1,\\
 \mathcal L_{\mathrm{CFM}}(\theta)
 &=\mathbb E_{X_0,X_1,s}\left[
 \left\|v_\theta(X_s,s)-(X_1-X_0)\right\|^2\right].
\end{aligned}
$$

In practice, sample $x_1$ from $\mathcal D$ and estimate the expectation with minibatches. The squared norm sums over all coordinates of the chunk; a mean reduction differs by a constant scale.

Let $Y=X_1-X_0$, $v=v_\theta(X_s,s)$, and $u=\mathbb E[Y\mid X_s,s]$. Squared-error decomposition gives

$$
\underbrace{\mathbb E\|v-Y\|^2}_{\mathcal L_{\mathrm{CFM}}}
=\underbrace{\mathbb E\|v-u\|^2}_{\mathcal L_{\mathrm{FM}}}
+\underbrace{\mathbb E\|Y-u\|^2}_{\text{independent of }\theta}.
$$

The cross term vanishes because $\mathbb E[Y-u\mid X_s,s]=0$. The two losses therefore have the same expected gradient. At the unrestricted population optimum, the network predicts the desired marginal velocity. Finite data, capacity, and optimization introduce approximation error.

Here, *conditional flow matching* refers to conditioning training paths on the endpoint $x_1$. This is separate from the observation conditioning we have left implicit. See [π₀](https://www.physicalintelligence.company/download/pi0.pdf) for an action-chunk policy using observation-conditioned flow matching.

## 8. From the sampler to a controller

- **Train:** sample $x_1$ from the dataset, independent noise $x_0$, and flow time $s$. Form $x_s=(1-s)x_0+sx_1$. Predict $v_\theta(x_s,s)$, regress against $x_1-x_0$, and update $\theta$.

- **Generate:** draw fresh $z_0\sim\mathcal N(0,I_d)$ and integrate the learned field. With $K$ Euler steps:

$$
z_{k+1}=z_k+\frac1K\,v_\theta\!\left(z_k,\frac{k}{K}\right),\qquad k=0,\ldots,K-1,\qquad \hat x=z_K.
$$

For control, reshape $\hat x$ into $H$ actions. At robot timestep $t$, the current observation supplies the implicit conditioning for this solve. A controller can execute a prefix of length $H_{\mathrm{exec}}\le H$, collect a new observation, and generate another chunk. Execution horizon, prediction horizon, and the number of flow steps $K$ are separate choices.

Training needs no ODE solve. Inference uses fresh noise and the observation, but not a data endpoint. Learning the demonstration distribution does not by itself establish closed-loop control performance.

**Limits to keep straight.** Straight training paths do not imply straight generated paths or accurate one-step sampling. Independent noise–data pairing is not globally optimal transport. The linear objective also appears in [rectified flow](https://arxiv.org/html/2209.03003v1#S2). Exact transport into a singular data distribution can require an endpoint limit; small terminal noise avoids the singular conditional endpoint.
