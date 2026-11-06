# RNN → Attention → Transformer

Written by Codex

How does a model use information spread across a sequence? An RNN carries a running state. Attention lets a prediction read from stored states. Self-attention gives every position its own read.

We will build that progression from sequence probabilities to the attention equation, using the same sentence to connect the diagrams and calculations.

## 1. Build a recurrent memory

Let $w_{1:T}$ be a sequence of discrete tokens. The chain rule writes its probability as

$$
p_\theta(w_{1:T})=\prod_{t=1}^{T}p_\theta(w_t\mid w_{<t}).
$$

This factorization is a probability identity. It does not specify a neural architecture. The architectural question is how to represent the prefix $w_{<t}$, whose length grows with $t$. A fixed input window discards older tokens; concatenating the entire prefix makes the input size vary. An RNN instead maintains a fixed-dimensional state.

For example, in “the cup next to the plates is …”, predicting the continuation may require information from several positions earlier. The model needs a way to preserve useful context as it reads.

### The state update

[Recurrent information flow through four states](../figures/rnn-attention-overview.html?panel=rnn&v=layout-v1)
Each word enters a state. Earlier information travels through the intervening states to influence a later prediction.

$$
h_t=f_\theta(h_{t-1},x_t).
$$

Embed token $w_t$ as $x_t=E(w_t)\in\mathbb R^{d_x}$, and let $h_t\in\mathbb R^{d_h}$. A vanilla recurrent update is

$$
\boxed{h_t=\tanh(W_hh_{t-1}+W_xx_t+b_h).}
$$

The same parameters are reused at every position. The state is a learned representation of the prefix, not a literal list of previous tokens. Once $h_t$ has read $w_t$, a linear output layer predicts the next token:

$$
p_\theta(w_{t+1}\mid w_{\le t})=\operatorname{softmax}(W_oh_t+b_o).
$$

Training minimizes next-token negative log-likelihood. We feed the observed prefix during training, often called *teacher forcing*; during generation, the prefix includes the model’s own previous outputs. Backpropagation through time differentiates the unrolled computation graph, accumulating gradients for the shared weights.

### What makes long sequences difficult?

There are two distinct difficulties: useful information must survive repeated state updates, and learning signals must traverse those updates. For the vanilla recurrence, define its local Jacobian

$$
J_t=\frac{\partial h_t}{\partial h_{t-1}}=\operatorname{diag}(1-h_t^2)W_h,

$$

$$
\frac{\partial h_t}{\partial h_k}=J_tJ_{t-1}\cdots J_{k+1}.
$$

Repeated multiplication can shrink or amplify gradients. This depends on the full sequence of Jacobians, not only on one weight matrix. [Pascanu, Mikolov, and Bengio](https://arxiv.org/abs/1211.5063) analyze this training difficulty. Gradient clipping limits large gradients; it does not recover a vanished signal.

LSTMs introduce a cell state with a gated additive update, schematically $m_t=f_t\odot m_{t-1}+i_t\odot\widetilde m_t$. A forget gate near one provides a direct route for retaining information. This helps memory, but a recurrent computation is still sequential. A decoder that receives only the final encoder state still has a single-vector interface.

## 2. Find the encoder–decoder bottleneck

Translation has an input sequence of length $n$ and an output sequence of length $m$; these need not match. An encoder reads the source into states $h_1,\ldots,h_n$. A basic encoder–decoder passes a fixed context $c=h_n$ to a recurrent decoder:

$$
\begin{aligned}
h_i&=f_{\mathrm{enc}}(h_{i-1},x_i),\qquad c=h_n,\\
s_t&=f_{\mathrm{dec}}(s_{t-1},E(y_{t-1}),c),\\
p_\theta(y_t\mid y_{<t},x_{1:n})&=\operatorname{softmax}(W_os_t+b_o).
\end{aligned}
$$

Here $y_0$ is a start token. This is one representative formulation; another passes the context through decoder initialization. The [sequence-to-sequence work of Sutskever, Vinyals, and Le](https://arxiv.org/abs/1409.3215) demonstrated learning through a fixed-vector encoding with LSTMs.

A final state must serve every future output. When translating a long sentence, the decoder may need a name now and an earlier verb later. **Why require the encoder to pack everything into one summary before knowing what each output needs?**

## 3. Derive attention as a weighted read

Keep the encoder states. At output step $t$, use the previous decoder state to score each source position, normalize those scores, and combine the stored states:

[A decoder query controls a read from source states](../figures/rnn-attention-overview.html?panel=cross&v=layout-v1)
Solid arrows carry information; the dashed arrow is the decoder query. Its weighted read supplies context to the current decoder step.

$$
\begin{aligned}
e_{ti}&=a_\theta(s_{t-1},h_i),\\
\alpha_{ti}&=\frac{\exp(e_{ti})}{\sum_{j=1}^{n}\exp(e_{tj})},\\
c_t&=\sum_{i=1}^{n}\alpha_{ti}h_i.
\end{aligned}
$$

**Score → normalize → read.** Scores measure compatibility; softmax makes a distribution over source positions; the weighted sum returns context.

Replace $c$ by $c_t$ in the decoder. The weights are nonnegative and sum to one. The context can mix several positions; it need not select exactly one word. An additive scoring function is $a_\theta(s,h)=v_a^\top\tanh(W_ss+W_hh+b_a)$, with learned parameters.

This is the mechanism developed by [Bahdanau, Cho, and Bengio](https://arxiv.org/abs/1409.0473): learn alignment together with translation. Their encoder uses bidirectional recurrent representations. Attention adds source access while keeping recurrence in the model.

### How the read learns

No manually labeled alignment is required for this soft-attention construction. The output likelihood trains the scoring function through the weighted sum. With the stored states held fixed,

$$
\frac{\partial c_t}{\partial e_{tj}}=\alpha_{tj}(h_j-c_t).
$$

Increasing one score shifts the context toward that state. Whether the shift helps the predicted output is determined by the downstream loss. Attention weights describe this particular read; they are not a complete explanation of a model’s reasoning.

### Separate queries, keys, and values

In the previous construction, $h_i$ serves both as something to compare against and as something to retrieve. Separate those roles:

| Vector | Role | In a recurrent decoder |
| --- | --- | --- |
| Query $q_t$ | What information is needed for this output? | A projection of $s_{t-1}$. |
| Key $k_i$ | How should this memory item be matched? | A projection of $h_i$. |
| Value $v_i$ | What information should be returned? | Another projection of $h_i$. |

With column vectors, write $q_t=W_Qs_{t-1}$, $k_i=W_Kh_i$, and $v_i=W_Vh_i$. A scaled dot-product score gives

$$
e_{ti}=\frac{q_t^\top k_i}{\sqrt{d_k}},\qquad
\alpha_{ti}=\operatorname{softmax}_i(e_{ti}),\qquad c_t=\sum_i\alpha_{ti}v_i.
$$

Queries and keys share dimension $d_k$; values can have a different dimension $d_v$. These names specify computational roles, not three hand-designed semantic labels. Learning decides which comparisons and retrieved features are useful.

**Why divide by the square root of the key dimension?**

As an initialization-scale argument, suppose query and key components are independent, zero-mean, unit-variance random variables. Then $\operatorname{Var}(q^\top k)=d_k$. Dividing by $\sqrt{d_k}$ keeps the variance near one and reduces softmax saturation as dimension increases. Learned vectors need not satisfy those assumptions exactly.

## 4. Follow one complete attention read

Suppose an encoder has read **“The black cat sleeps”**, and a decoder is producing **“Le chat noir dort.”** The word order changes: the decoder needs information about “cat” before “black.” Keeping access to all source states lets it retrieve different information at each output step.

Read the heatmap **one row at a time**. A row is a decoder query; a column is a source key. Darker cells mean larger attention weights. Select “chat” or “noir” to follow that row through the weighted sum below. The vectors beside the English words are the *values* being combined.

[Interactive translation attention heatmap and diagram of a weighted value read](../figures/rnn-to-attention.html?v=translation-v1)

Illustrative vectors and alignments, not measurements from a trained translator. French words label decoder steps; they are not fed in as the queries. A trained model would produce each query from its decoder state and learn its key and value projections.

For the “chat” row at the default setting, the query is $q=(0,0,3,0)$. The source keys are twice the four coordinate basis vectors, so dividing the dot products by $\sqrt{4}$ gives scores $(0,0,3,0)$. Softmax produces approximately $(0.043,0.043,0.870,0.043)$: most of the read comes from “cat,” but every value contributes.

$$
\begin{aligned}
c_{\text{chat}} &\approx 0.043(1,0)+0.043(0,2)\\
&\quad+0.870(3,1)+0.043(-1,1)\\
&\approx (2.61,1.00).
\end{aligned}
$$

The two value coordinates are arbitrary features chosen to make the arithmetic visible. The context is a vector supplied to the decoder, not a translated word by itself. Move **query strength to zero**: all scores become equal, every row becomes uniform, and all four steps receive the same mean value $(0.75,1)$. Increasing query strength makes the illustrated reads more selective; real attention can also spread useful weight across several source words.

## 5. Let every position read

So far, the queries came from a decoder and the memory came from an encoder: *cross-attention*. For self-attention, obtain all three from the same input matrix $X\in\mathbb R^{n\times d}$:

[Self-attention connects input positions to output reads](../figures/rnn-attention-overview.html?panel=self&v=layout-v1)
Highlighted arrows show one read; faint arrows show the others. All outputs use the same input layer. This diagram shows full, unmasked attention.

$$
Q=XW_Q,\qquad K=XW_K,\qquad V=XW_V.
$$

Here the projection matrices follow the row-vector convention. Each position produces a query and reads from the allowed positions. Outputs depend on the same layer’s input vectors, so all these reads can be computed together. Unlike an RNN update, computing output $o_i$ does not require first computing output $o_{i-1}$.

This offers a direct information path between allowed token positions. Dense attention computes $n^2$ pairwise scores, trading recurrent compression for access to a growing collection of vectors. It does not eliminate all difficulties of learning long-range dependencies.

$$
o_i=\sum_j\alpha_{ij}v_j.
$$

### Compute all reads together

Now store vectors as *rows*. Stack $m$ queries into $Q$, and $n$ keys and values into $K,V$:

$$
\begin{aligned}
Q&\in\mathbb R^{m\times d_k},\quad K\in\mathbb R^{n\times d_k},\quad V\in\mathbb R^{n\times d_v},\\
S&=QK^\top/\sqrt{d_k},\quad A=\operatorname{softmax}_{\mathrm{row}}(S).
\end{aligned}
$$

$$
\boxed{O=\operatorname{softmax}_{\mathrm{row}}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V.}
$$

Row $i$ of $A$ describes where query $i$ reads. The softmax runs over keys, not queries. Multiplying by $V$ performs a weighted sum for each query. This is the same calculation as the explorer, repeated for multiple queries.

### Add order and a causal mask

**Order:** without positional information or an order-dependent mask, self-attention is permutation equivariant: rearranging the input rows rearranges the output rows in the same way. Token content alone cannot distinguish all arrangements. Positional embeddings or position-dependent attention terms supply order.

**Causality:** a next-token predictor must not read future tokens. With row $i$ reading input token $w_i$ and predicting $w_{i+1}$, allow keys $j\le i$:

$$
A=\operatorname{softmax}_{\mathrm{row}}(S+B),\qquad
B_{ij}=\begin{cases}0,&j\le i,\\-\infty,&j>i.\end{cases}
$$

Future positions then receive zero weight. During teacher-forced training, all shifted input tokens are known, so masked predictions can be computed in parallel. Autoregressive generation still produces tokens sequentially because the next input token has not yet been generated.

## 6. Put attention inside a Transformer

A Transformer combines attention with feedforward layers, residual connections, normalization, and positional information. Multiple heads use separate learned projections, concatenate their outputs, and project the result. This lets a layer combine several different reads; it does not guarantee that each head has a distinct human-interpretable function. See [Attention Is All You Need](https://arxiv.org/abs/1706.03762).

The important progression is: **carry a state → preserve source states → retrieve with a query → let every position retrieve.** Attention first solved an access problem inside recurrent encoder–decoders. It then became useful as an interaction mechanism in its own right.

For robotics, the stored vectors need not represent words. They could represent image patches, observation history, or object features. A query can retrieve information relevant to an action prediction. What makes this attention is the learned matching and weighted read; the surrounding model determines what is predicted and how temporal or spatial structure is represented.

### Check my understanding

- **Why does an RNN need a state?** To reuse a fixed-size computation while representing a variable-length prefix.

- **What did attention change in sequence-to-sequence models?** The decoder gained a fresh read from source states at every output step.

- **Why separate keys and values?** Features useful for matching need not be the same features useful to return.

- **Why can self-attention train in parallel while generation stays sequential?** Known training inputs permit parallel masked reads; future generated tokens are not yet available.

- **Does attention remove recurrence automatically?** No. An RNN can use attention, and an attention layer alone is not a complete Transformer.

**References**

Motivated by Justin Johnson’s Michigan lectures on [recurrent networks](https://raw.githubusercontent.com/AndreiKeino/EECS-498-007-598-005-Deep-Learning-for-Computer-Vision/master/slides/498_FA2019_lecture12.pdf) and [attention](https://raw.githubusercontent.com/AndreiKeino/EECS-498-007-598-005-Deep-Learning-for-Computer-Vision/master/slides/498_FA2019_lecture13.pdf) (2019 slides, community mirror). Original papers are linked beside the relevant derivations.

Diagrams and numerical alignments are original, illustrative constructions, not outputs from a trained model.
