---
layout: post
title: Finite Markov Decision Process
date: 2017-10-12
tag: Reinforcement Learning
use_math: True
---
In reinforcement learning, the purpose of the agent is to maximize the total amount of cumulative reward it receives in the long run. 

### Returns

We can define the cumulative reward formally by

$$
\begin{eqnarray} 
G_t = R_{t+1} + \gamma R_{t+2} + \gamma^2 R_{t+3} + \cdots = \sum^{\infty}_{k=0} \gamma^k \cdot R_{t+k+1}
\end{eqnarray}$$

