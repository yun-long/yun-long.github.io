---
title: Information Loss Bounded Policy Optimization 
summary: Transfering the KL-divergence constraint in policy search into a bounded penalty. 
tags:
  - Reinforcement Learning 
date: '2018-09-01'

# Optional external URL for project (replaces project detail page).
external_link: ''

image:
  caption: Photo by Yunlong 
  focal_point: Smart

url_code: ''
url_pdf: 'https://link.springer.com/chapter/10.1007/978-3-030-41188-6_8'
url_slides: ''
url_video: ''

# Slides (optional).
#   Associate this project with Markdown slides.
#   Simply enter your slide deck's filename without extension.
#   E.g. `slides = "example-slides"` references `content/slides/example-slides.md`.
#   Otherwise, set `slides = ""`.
# slides: example
---

Proximal and trust-region policy optimization methods belong to the standard reinforcement learning toolbox. 
Notably, PPO can be viewed as transforming the constrained TRPO problem into an unconstrained one, 
either via turning the constraint into a penalty or via objective clipping. In my master thesis, 
an alternative problem reformulation was studied, where the information loss is bounded using 
a novel transformation of the KullbackLeibler (KL) divergence constraint. In contrast to PPO, 
the considered method does not require tuning of the regularization parameter, which is known 
to be hard due to its sensitivity to the reward scaling. The resulting algorithm, termed 
information-loss-bounded policy optimization, both enjoys the benefits of the first-order methods, 
being straightforward to implement using automatic differentiation, and maintains the advantages 
of the quasi-second order methods. It performs competitively in simulated OpenAI MuJoCo environments 
and achieves robust performance on a real robotic task of the Furuta pendulum swing-up and stabilization.
{style="text-align: justify;"}

# [![Watch the video](https://img.youtube.com/vi/Fu0hagqkuAI/0.jpg)](https://youtu.be/Fu0hagqkuAI)


