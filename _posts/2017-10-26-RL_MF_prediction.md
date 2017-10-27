---
layout: post
title: Model-Free Prediction
date: 2017-10-26
tag: Reinforcement Learning
use_math: True
---
### Model-Free Prediction

**Estimate the value function of an unknown MDP.**

> * Monte Carlo Learning
* Temperal-Difference Learning

### Monte Carlo Learning 

Different from *Dynamic Programming*, Monte Carlo method does not require complete knownledge of the environment. Monte Carlo methods are ways of solving the reinforcement learning problem based on averaging sample returns. To ensure that well-defined returns are available, here we define Monte Carlo methods only for episodic tasks. That is, we assume experience is divided into episodes, and that all episodes eventually terminate no matter what actions are selected.

It has following properties:

> * Monte Carlo learn directly from episodes of experience
* Monte Carlo is model-free, no knownledge of MDP transitions / rewards
* Monte Carlo learns from complete episodes, no bootstrapping
* Monte Carlo uses the simplest possible idea: **value = mean return**

The goal of Monte Carlo method is to learn the state-value function for a given policy. Recall that the value of a state is the expected return, expected culmulative future discounted reward, starting from that state. An obvious way to estimate it from experience, then, is simply to average the returns observed after visits to that state. As more returns are observed, the average should converge to the expected value. This idea underlies all Monte Carlo methods.

<img src="/images/posts/RL_MF/MC.png" height="330" width="500">  

Suppose we wish to estimate $$v_{\pi}(s)$$, the value of a state $$s$$ under policy $$\pi$$, given a set of episodes obtained by following policy $$\pi$$ and passing through $$s$$. Each occurrence of state $$s$$ in an eposide is called a visit to $$s$$. $$s$$ may be visited multiple times in the same episode; let us call the first time it is visited in an episode *the first visit* to $$s$$.  

***First-visit Monte Carlo policy evaluation*** is shown in procedural form in the box. 

<img src="/images/posts/RL_MF/first-mc.png" height="230" width="500">  


### Temporal Difference Learning

TD learning is a combination of Monte Carlo ideas and Dynamic Programming ideas. Like Monte Carlo methods, TD methods can learn directly from raw experience without a model of the environment's dynamics. Like Dynamic Programming, TD methods update estimates based in part on other learned estimates, without waiting for a final outcome [bootstrap].

Temporal Difference methods have following properties:

> * TD methods learn directly from episodes of experience
* TD is model-free: no knowledge of MDP transitions / rewards
* TD learns from incomplete episodes, by bootstrapping
* TD updates a guess towards a guess

<img src="/images/posts/RL_MF/TD.png" height="200" width="500">  

### Monte Carlo vs. Temporal Difference

Roughly speaking, ***Monte Carlo*** methods wait until the return following the visit is known, then use that return as a target for $$V(S_t)$$. For example, a very simple *every visit* Monte Carlo method suitable for nonstationary environments is

$$
\begin{eqnarray}
V(S_t) \leftarrow V(S_t) + \alpha [G_t - V(S_t)]
\end{eqnarray}
$$

***TD*** methods need wait until the next time step. At time $$t+1$$ they immediately form a target and make a useful update using the observed reward $$R_{t+1}$$ and the estimate $$V(S_{t+1})$$. The $$TD(0)$$ is 

$$
\begin{eqnarray}
V(S_t) \leftarrow V(S_t) + \alpha [R_{t+1} + \lambda V(S_{t+1}) - V(S_t)]
\end{eqnarray}
$$

<img src="/images/posts/RL_MF/MCvsTD0.png" height="320" width="500">  
<img src="/images/posts/RL_MF/MCvsTD1.png" height="320" width="500">  
<img src="/images/posts/RL_MF/MCvsTD2.png" height="320" width="500">  

### Backups
<img src="/images/posts/RL_MF/backup_DP.png" height="320" width="500">  
<img src="/images/posts/RL_MF/backup_monte.png" height="320" width="500">  
<img src="/images/posts/RL_MF/backup_TD.png" height="320" width="500">  
