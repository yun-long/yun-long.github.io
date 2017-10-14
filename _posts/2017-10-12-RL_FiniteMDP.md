---
layout: post
title: Finite Markov Decision Process
date: 2017-10-12
tag: Reinforcement Learning
use_math: True
---
In reinforcement learning, the purpose of the agent is to maximize the total amount of cumulative reward it receives in the long run. 

### The Markov Property 

What we would like, ideally, is a state signal that summarizes past sensations compactly, yet in such a way that all relevant information is retained. A state signal that succeeds in retaining all relevant information is said to be Markov, or to have the **Markov property**.  

Now, we can define the Markov Property formally for the reinforcement learning problem,

$$
\begin{eqnarray}
\mathbb{P}[S_{t+1} | S_t] = \mathbb{P}[S_{t+1} | S_1, S_2, \cdots, S_t]
\end{eqnarray}
$$

> * The state captures all relevant information from the history.
* Once the state is known, the history may be thrown away. 

### Markov Processes

In reinforcement learning, the task that satisifies the Markov property is called ***Markov Decision Process***, or ***MDP***. If the state and action spaces are finite, then it is called a *finite Markov decision process \[finite MDP\]*. 

 ***Markov Process***

> * A Markov Process is a memoryless random process, i.e. a sequence of random states $$S_1, S_2, \cdots $$ with the Markov property.
* A Markov Process \[or Markov Chain\] is a tuple $$<S, P>$$
	* S is a finite set of states
	* P is a state transition probability matrix, $$P_{ss'} = \mathbb{P}[S_{t+1}=s' \vert S_t = s]$$
	

***Markov Reward Process***

> * A Markov Reward Process is a Markov chain with values.
* A Markov Reward Process is a tuple $$<S, P, R, \gamma>$$
	* S is a finite set of states
	* P is a state transition probability matrix, $$P_{ss'} = \mathbb{P}[S_{t+1}=s' \vert S_t = s]$$
	* R is a reward function, $$R_s = \mathbb{E}[R_{t+1} \vert S_t=s]$$
	* $$\gamma$$ is a discount factor, $$\gamma \in [0, 1]$$

### Returns and Value Function

***Returns***

We can define the cumulative discounted reward from time step $$t$$ as return $$G_t$$ formally, 

$$
\begin{eqnarray} 
G_t = R_{t+1} + \gamma R_{t+2} + \gamma^2 R_{t+3} + \cdots = \sum^{\infty}_{k=0} \gamma^k \cdot R_{t+k+1}
\end{eqnarray}$$

where $$\gamma$$ is called the discount rate, and $$R_{t+1}, R_{t+2}, R_{t+3}$$ is the sequence of reward after time step $$t$$. 

> * The discount rate $$\gamma \in [0, 1]$$ is the present value of future rewards.
* The value of receiving reward $$R$$ after $$k+1$$ time steps is $$\gamma^k R$$.
* $$\gamma$$ close to 0 leads to "myopic" evaluation
* $$\gamma$$ close to 1 leads to "far-sighted" evaluation

Most Markov reward and decision process are discounted, because, 

> * Avoids infinite returns in cyclic Markov process
* Uncertainty about the future may not be fully represented, the model is not perfect
* Immediate rewards may earn more interest than delayed rewards 
* ... 

***Value Function***

The value function $$v(s)$$ gives the long-term value of state $$s$$. 
**The state value function $$v(s)$$ of an Markov Reward Process is the expected return starting from state $$s$$**.  
The value function can be decomposed into two parts (**Bellman Equation for MRPs**).

> * immediate reward $$R_{t+1}$$
* discounted value of successor state $$\gamma v(S_{t+1})$$

$$
\begin{eqnarray}
v(s) &=& \mathbb{E}[G_t \vert S_t = s] \\
&=& \mathbb{E}[R_{t+1} + \gamma R_{t+2} + \gamma^2 R_{t+3} + \cdots  \vert S_t=s] \\
&=& \mathbb{E}[R_{t+1} + \gamma R (R_{t+1} + R_{t+2} + \cdots ) \vert S_t=s] \\
&=& \mathbb{E}[R_{t+1} + \gamma G_{t+1} \vert S_t=s] \\
&=& \mathbb{E}[R_{t+1} + \gamma v(S_{t+1}) \vert S_t=s] \quad \text{Bellman Equation for MRPs}
\end{eqnarray}
$$

***Bellman Equation in Matrix Form***

The Bellman equation can be expressed concisely using matrices, 

$$
\begin{eqnarray}
\pmb{v} = \pmb{R} + \gamma  \cdot \pmb{P} \cdot \pmb{v}
\end{eqnarray}
$$

where $$\pmb{v}$$ is a column vector with one entry per state,

$$\begin{equation}
	\begin{bmatrix}
	v(1)    \\
	\vdots        \\
	v(n)          
	\end{bmatrix} = 
	\begin{bmatrix}
	R(1)    \\
	\vdots        \\
	R(n)          
	\end{bmatrix} + \gamma
	\begin{bmatrix}
	P_{11}       & \cdots & P_{1n}    \\
	\vdots        &  \ddots &    \vdots \\
	P_{n1}       & \cdots & P_{nn}
	\end{bmatrix}
	\begin{bmatrix}
	v(1)    \\
	\vdots        \\
	v(n)          
	\end{bmatrix} 
\end{equation}$$

### Markov Decision Process

A Markov Decision Process [MDP] is a Markov reward process with decisions. It is an environment in which all states are Markov.

> * A Markov Decision Process is a tuple $$<S, A, P, R, \gamma>$$
* $$S$$ is a finite set of states
* $$A$$ is a finite set of actions
* $$P$$ is a state transition probability matrix, $$P^a_{ss'} = \mathbb{P}[S_{t+1}=s' \vert S_t=s, A_t=a]$$
* $$R$$ is a reward function, $$R^a_s=\mathbb{E}[R_{t+1} \vert S_t=s, A_t=a]$$
* $$\gamma$$ is a discount factor, $$\gamma \in [0,1]$$ 

### Policies

A policy $$\pi$$, is a mapping from each state $$s \in S$$, and action $$a \in A(s)$$, to the probability $$\pi(a \vert s)$$ of taking action $$a$$ when in state $$s$$. Or a policy is $$\pi$$ is a probability distribution over actions given states.

$$
\begin{eqnarray}
\pi (a \vert s) = \mathbb{E}[A_t = a \vert S_t = s]
\end{eqnarray}
$$

> * A policy fully defines the behaviour of an agent. 
* Markov decision process policies depend on current state.
* Policies are stationary [time independent].

### Value Functions

***state-value function***
	
The *state-value function* $$v_{\pi}(s)$$ of an MDP is the expected return starting from state $$s$$, and then following the policy $$\pi$$. 

$$
\begin{eqnarray}
v_{\pi}(s) &=& \mathbb{E}_{\pi}[G_t \vert S_t = s] \\
&=& \mathbb{E}_{\pi}[R_{t+1} + \gamma v_{\pi}(S_{t+1}) \vert S_t = s] 
\end{eqnarray}
$$

***action-value function***

The *action-value function* $$q_{\pi}(s, a)$$ is the expected return starting from state $$s$$, taking action $$a$$, following policy $$\pi$$.

$$
\begin{eqnarray}
q_{\pi}(s, a) &=& \mathbb{E}_{\pi}[G_t \vert S_t = s, A_t = a] \\
&=&\mathbb{E}_{\pi} [R_{t+1} + \gamma q_{\pi}(S_{t+1}, A_{t+1}) \vert S_t=s, A_t=a]
\end{eqnarray}
$$

***Bellman Expectation Equation***

<img src="/images/posts/RL_MDP/bellman_v.png" height="300" width="500">  
<img src="/images/posts/RL_MDP/bellman_q.png" height="300" width="500">  
<img src="/images/posts/RL_MDP/bellman_v2.png" height="300" width="500">  
<img src="/images/posts/RL_MDP/bellman_q2.png" height="300" width="500">  


### Optimal Value Function

The *optimal state-value function* $$v_{\ast}$$ is the maximum  value function over all policies.

$$
\begin{eqnarray}
v_{\ast}(s) = \max_{\pi} v_{\pi} (s)
\end{eqnarray}
$$

The *optimal action-value function* $$q_{\ast}$$ is the maximum action-value function over all policies.

$$
\begin{eqnarray}
q_{\ast}(s, a) = \max_{\pi} q_{\pi} (s, a)
\end{eqnarray}
$$

### Optimal Policy

For any Markov Decision Process,

> * There exists an optimal policy $$\pi_{\ast}$$ that is better than or equal to all other policies, $$\pi_{\ast} \geq \pi, \forall \pi$$
* All optimal policies achieve the optimal value function, $$v_{\pi_{\ast}} = v_{\ast}(s)$$
* All optimal policies achieve the optimal action-value function, $$q_{\pi_{\ast}} = q_{\ast}(s, a)$$













