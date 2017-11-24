---
layout: post
title: GridWorld and Value Iteration
date: 2017-10-26
tag: Reinforcement Learning
use_math: True
---
### Grid World Environment

A gridworld envrionment used for the implementation of reinforcement learning algorithms. 
In this setup, the gridworld is a simulation of a flat or apartment of 9 x 10 states in total. 
An agent or a robot tries to clean the room by collecting dirt, which represented by a black circle in below gridworld environment. Simultaneous, the robot has to avoid extremely dangerous states, water and cat, in order to protect its vulnerable sensors. The naughty robot enjoys playing with the toy when comming across with it. 

***States***:

> * "Black cell" denotes extremely dangerous states that the robot must avoid. Reward (O) = -1e5
* "Black circle" denotes Dirt to be collected by the robot. Reward (D) = 35
* "Warter drop" denotes Water that robot should try to avoid. Reward (W) = -100
* "Cat" denotes Cat which may badly damage the robot. Reward (C) = -3000
* "Money" denotes Toy that the robot enjoys playing with them. Reward (T) = 1000

***Actions***:

 > * Down
 * Right
 * Up
 * Left
 * Stay

<img src="/images/posts/RL_MF/gridworld.png" height="600" width="1000">  

### Value Iteration
<img src="/images/posts/RL_MF/value.gif" height="600" width="800"> 

### Optimal Policy
<img src="/images/posts/RL_MF/policy.png" height="600" width="1000">  