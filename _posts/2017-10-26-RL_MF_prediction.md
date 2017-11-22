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

Monte Carlo Learning has following properties:

> * Monte Carlo learn directly from episodes of experience
* Monte Carlo is model-free, no knownledge of MDP transitions / rewards
* Monte Carlo learns from complete episodes, no bootstrapping
* Monte Carlo uses the simplest possible idea: **value = mean return**

The goal of Monte Carlo method is to learn the state-value function for a given policy. Recall that the value of a state is the expected return, expected culmulative future discounted reward, starting from that state. An obvious way to estimate it from experience, then, is simply to average the returns observed after visits to that state. As more returns are observed, the average should converge to the expected value. This idea underlies all Monte Carlo methods.

<img src="/images/posts/RL_MF/MC.png" height="330" width="500">  

Suppose we wish to estimate $$v_{\pi}(s)$$, the value of a state $$s$$ under policy $$\pi$$, given a set of episodes obtained by following policy $$\pi$$ and passing through $$s$$. Each occurrence of state $$s$$ in an eposide is called a visit to $$s$$. $$s$$ may be visited multiple times in the same episode; let us call the first time it is visited in an episode *the first visit* to $$s$$.  

***First-visit Monte Carlo policy evaluation*** is shown in procedural form in the box. 

<img src="/images/posts/RL_MF/first-mc.png" height="230" width="500">  

### Blackjack Example [MC Learning]
Blackjack, also known as 21, is one of the most popular card game between usually several players and a dealer in Casinos. The objective of the game is to beat the dealer in one of the following ways:

> * Get 21 points on the player's first two cards ["Blackjack"],  without a dealer blackjack;
* Reach a final score higher than the dealer without exceeding 21
* Let the dealer draw additional cards until the dealers's hand exceeds 21

To understand Monte Carlo Learning method in depth, we use a simple Blackjack example that comes from [Denny Britz's github](https://github.com/dennybritz/reinforcement-learning) and uses OpenAI Gym toolkit. 

First, we create a very simple policy for players to play the Blackjack, if the score of the player's hand is greater than 20, sticks, otherwise hits. 

{% highlight python %}
def sample_policy(observation):
    """
    A policy that sticks if the player score is >= 20 and hits otherwise.
    """
    score, dealer_score, usable_ace = observation
    return 0 if score >= 20 else 1
{% endhighlight %}

Second, following this simple policy, we therefore calculate the state-value function by using First-visit Monte Carlo sampling method.

{% highlight python %}
def mc_prediction(policy, env, num_episodes, discount_factor=1.0):
    """
    Monte Carlo prediction algorithm. Calculates the value function
    for a given policy using sampling.
    
    Args:
        policy: A function that maps an observation to action probabilities.
        env: OpenAI gym environment.
        num_episodes: Nubmer of episodes to sample.
        discount_factor: Lambda discount factor.
    
    Returns:
        A dictionary that maps from state -> value.
        The state is a tuple and the value is a float.
    """

    # Keeps track of sum and count of returns for each state
    # to calculate an average. We could use an array to save all
    # returns (like in the book) but that's memory inefficient.
    returns_sum = defaultdict(float)
    returns_count = defaultdict(float)
    
    # The final value function
    V = defaultdict(float)
    
    for i_episode in range(1, num_episodes + 1):
        # Generate an episode.
        # An episode is an array of (state, action, reward) tuples
        episode = []
        state = env.reset()
        for t in range(100): # integer 100 guarantees the episode to teminate eventually
            action = policy(state)
            next_state, reward, done, _ = env.step(action)
            episode.append((state, action, reward))
            if done:
                break
            state = next_state

        # Find all states the we've visited in this episode
        # We convert each state to a tuple so that we can use it as a dict key
        states_in_episode = set([tuple(x[0]) for x in episode])
        for state in states_in_episode:
            # Find the first occurance of the state in the episode
            first_occurence_idx = next(i for i,x in enumerate(episode) if x[0] == state)
            # Sum up all rewards since the first occurance
            G = sum([x[2]*(discount_factor**i) for i,x in enumerate(episode[first_occurence_idx:])])
            # Calculate average return for this state over all sampled episodes
            returns_sum[state] += G
            returns_count[state] += 1.0
            V[state] = returns_sum[state] / returns_count[state]

    return V
{% endhighlight %}

Eventually, plot the **Results**

<img src="/images/posts/RL_MF/blackjack_01.png">  
<img src="/images/posts/RL_MF/blackjack_02.png">  

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
