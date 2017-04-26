---
layout: post
title: Robot Learning [Model Learning]
date: 2017-04-25 
tag: Reinforcement Learning
use_math: true
---
<img src="/images/posts/RL_intro/digram.png" height="250" width="400">  

Learning models can be easier than physical modelling as well as of learning control policies. Using learned models to obtain a new policy is very data efficient. 

### Model Learning for Control
Optimal control is an optimization method for deriving control laws. The goal is to find a optimal law or policy in order to follow the desired trajectory that minimizes a cost funtion. 
\begin{equation}
\mathbf{ \dot{x} } = \mathbf{f(x, u, \tau)}
\end{equation}

\begin{equation}
\mathbf{ u } = \mathbf{\pi(x, \theta, \tau)}
\end{equation}

Dynamic programming, intdoduced in the 1940s by Richard Bellman, are often used for optimization. A dynamic programming algorithm will examine the previously solved subproblems and will combine their solutions to give the best solution for the given problem. Unfortunately, optimal control relies on an exact model and can be solved exactly for only two cases, linear control or control within a discrete state space. However, as the state space for a learning system becomes high dimensional, its combinational state space exponentially explodes. Thus, finding an optimal control policy is not
always feasible, but global optimality is not always required. Learning algorithms can be employed to derive a reasonably good policy.

###Learning a model for control

The environment a robot operates in, the objects a robot interacts with as well as the robot itself, i.e. its mechanical system, the kinematics and dynamics can be modelled. It has initially been thought that learning control e.g. by reinforcement learning reduces the need for an accurate model of the mechanical system to be controlled. However, it became apparent that the existence of accurate models directly impacts intitial performance and learning efficiency. Better models lead to faster command error correction while reducing the amount of practice needed to attain a given level
of performance.

Often however, analytical models are not sufficient or accurate enough or too costly to derive. Rigid body dynamics, albeit well understood, are not expressive enough for most real world applications. Therefore, the model is often learned. Learned models also remove the necessity for building robotswith the focus on being straightforward to model. They can be chosen to fulfill the tasks requirements in terms of compliance with the environment, energy efficiency, and other factors. Online learning can be employed to generalize learned models to gradually adapt for mechanical
wear and tear and larger state space.

###Model-based learning

Once we have infered the behavior of the system either analytically or by learning from observations, we must determine how to optimally manipulate the system. While the first part is a pure modelling problem, the second question is related to the learning control architectures which can be used together with the model. Given a perfect model, it is possible to solve the optimal control problem exactly for two limited cases using recursive algorithms such as value iteration (1957) or policy iteration (1960). The limitations are severe: the model may only depend linearly on the state and action with quadratic rewards or the model must be discrete in states and actions. While the later limitation seems less severe, such models are often impractical due to the curse of dimensionality in robotics.


### Example

The new and improved Spinbot 2000 is a multi-purpose robot platform. It is made of a kinematic chain consisting of a linear axis $q_1$, a rotational axis $q_2$ and another linear axis $q_3$, as shown in the figure below. These three joints are actuated with forces and torques of $u_1$, $u_2$, and $u_3$. Different end effectors, including a gripper or a table tennis racket, can be mounted on the end of the robot, indicated by the letter $E$. Thanks to Spinbot’s patented SuperLight technology, the robot’s mass is distributed according to one point mass of $m_1$ at the second joint and another point mass of $m_2$ at the end of the robot $E$.

<img src="/images/posts/RL_intro/Spinbot.png" height="250" width="400">  

The inverse dynamics model of the Spinbot is given as

$$
\begin{eqnarray} 
u_1 &=& (m_1 + m_2)(\ddot{q}_1 + g) \\
u_2 &=& m_2 (2 \dot{q}_3 \dot{q}_2 q_3 + q^2_3 \ddot{q}_2) \\
u_3 &=& m_3 (\ddot{q}_3 - q_3 \dot{q}^2_2)
\end{eqnarray}$$

We now collected 100 samples from the robot while using a PD controller with gravity compensation at a rate of 500Hz.

|   | $t_1$ | $t_2$  | $t_3$ | $t_4$  | ... |
| ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| $q_1 [m]$  |  9.5172117e-03 | -9.2611603e-04 |  4.0551555e-05 |  2.8226825e-02| ...|
| $q_2 [rad]$  |  3.2824465e-01  | 3.3445362e-01 |  3.1897172e-01  | 3.2161781e-01 | ... |
| $q_3 [m]$  |     5.0045217e-01  | 4.8983594e-01  | 5.0331549e-01  | 5.0652082e-01 | ... |
| $\dot{q}_1 [m/s]$   | 1.1962505e-01 | -7.8695971e-02 | -8.1086599e-02 | -7.8143931e-03 | ... |
| ...   | ... |  ...  | ...  | ... | ... |
| $\ddot{q}_3 [m/s^2]$   |  2.5379257e+01  | 2.5107246e+01  | 2.4383586e+01  | 2.3918234e+01   | ... |
| $u_1 [N]$   |  1.6619316e+01  | 1.7534750e+01 |  1.8634601e+01  | 1.9602132e+01 | ... |
| $u_2 [Nm]$   | -1.1268444e+00 | -3.4098313e+00 | -4.8945703e+00 | -5.7157718e+00 | ... |
| $u_3 [N]$   | 3.1560788e+01 |  3.1328278e+01  | 3.0700782e+01  | 2.9724454e+01 | ... |

**1. Inverse Dynamics**

Given this data, we want to learn the **inverse dynamics** of the robot to use a model-based controller. The inverse dynamics of the system will be modeled as $\boldsymbol{u=\phi( q, \dot{q}, \ddot{q} )^{T}} \boldsymbol{\theta}$, where $\boldsymbol{\phi( q, \dot{q}, \ddot{q} )}$ are features and $\boldsymbol{\theta}$ are the parameters. Therefore, this problem can be viewed as regression problem. However, the independent and identically distributed [i.i.d. or iid or IID] assumption, a standard assumption of regression methods, has been violated by taking the data from trajectories, because the samples are not acutally independent and will not be identically distributed. 

**2. Features and Parameters**

Assuming that the gravity $g$ is unknown, the feature matrix $\boldsymbol{\phi}$ and the corresponding parameter vector $\boldsymbol{\theta}$ for $\mathbf{u} = [u_1, u_2, u_3]^T$ can be wrote as, 

$$\begin{equation}

\boldsymbol{\phi(q,\dot{q},\ddot{q})}= 
	\begin{bmatrix}
	\ddot{q}_{1}       & 0 & 0  \\
	\ddot{q}_{1}        &2\dot{q}_{3}\dot{q}_{2}q_{3}+\dot{q}_{3}^{2}\ddot{q}_{2}  &  \ddot{q}_{3}-q_{3}\dot{q}_{2}  \\
	1       & 0 & 0 
	\end{bmatrix}

	\mathrel{,}

	\boldsymbol{\theta} = 
	\begin{bmatrix}
	m_{1}     \\
	m_{2}        \\
	m_1g+m_2g    \\ 
	\end{bmatrix}
\end{equation}$$

**3. Learning the Parameters**

We want to compute the parameters $\boldsymbol{\theta}$ minimizing the squared error between the estimated forces/ torques and the actual forces/torques. 

Minimizie the squared error:  
\begin{equation}
\min \boldsymbol{ (\Phi^T \theta-U)^T (\Phi^T \theta-U) }
\end{equation}

using:

$$
\begin{eqnarray} 
\boldsymbol{\Phi} &=& \boldsymbol{[\phi(x_1), \phi(x_2), \phi(x_3), ... , \phi(x_n)]^T}, n = 100 \\
\boldsymbol{U} &=& \boldsymbol{[u_1, u_2, u_3, ... , u_n]^T}, n = 100 
\end{eqnarray}$$

The loss function is :

\begin{equation}
\boldsymbol{J = \frac{1}{2} (U- \Phi\theta)^T (U- \Phi\theta)}
\end{equation}

The solution therefore is $\boldsymbol{\theta = (\Phi^T \Phi)^{-1} \Phi^T U}$

The learned parameters are $\boldsymbol{\theta}=[-0.073, 1.649, 15.095]$. Also, we can recover recover the massess from the learned parameters. However, the model is not plausible, as $m_1=-0.0730$, which is physically impossible. 

**4. Model Evaluation** 

We can plot the forces and torques predicted by your model over time, as well as those recorded in the data and comment
the results.

Forces / torques for the first joint $q_1$:
<img src="/images/posts/RL_intro/u1.png" height="200" width="300">  
Forces / torques for the second joint $q_2$:
<img src="/images/posts/RL_intro/u2.png" height="200" width="300">  
Forces / torques for the third joint $q_3$:
<img src="/images/posts/RL_intro/u3.png" height="200" width="300">  

The red line represents the forces/torques predicted from the learned model. And the blue line represents the recorded forces/torques. The prediction for the first joint is almost perfect. Also the one for the third joint is acceptable. However, the prediction for the second model is not very accurate. The reason is that your model most likely did not capture all the features necessary for describing the real robot’s inverse dynamics. Without designing many features by hand, you could learn a non-parametric model using kernel regression or locally weighted regression.




