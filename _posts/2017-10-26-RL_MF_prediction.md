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

***First-visit Monte Carlo policy evaluation*** is shown in procedural form in the box. 

<img src="/images/posts/RL_MF/first-mc.png" height="230" width="500">  