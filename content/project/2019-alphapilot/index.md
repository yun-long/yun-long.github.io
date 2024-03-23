---
title: Time-Optimal Motion Primitives 
summary: Derivation of (minimum-time) time-optimal motion primitives using Pontryagin's Maximum Principle
tags:
  - Optimal Control 
date: '2019-09-01'

# Optional external URL for project (replaces project detail page).
external_link: ''

image:
  caption: Photo by Yunlong 
  focal_point: Smart

url_code: ''
url_pdf: 'uploads/timeoptimal.pdf'
url_slides: ''
url_video: ''

# Slides (optional).
#   Associate this project with Markdown slides.
#   Simply enter your slide deck's filename without extension.
#   E.g. `slides = "example-slides"` references `content/slides/example-slides.md`.
#   Otherwise, set `slides = ""`.
# slides: example
---

In this project, I derived a time-optimal motion primitive (closed-form solution) for quadrotor trajectory planning in autonomous drone racing. 
The main idea is the following: 1) approximating the quadrotor as a point-mass model;
2) formulating the minimum-time problem as a constrained optimization problem, with both the acceleration and velocity as constraints;
3) solving the constrained problem using Pontryagin’s Maximum Principle.
This motion primitive has been demonstrated to successfully push the drone to reach speeds up to 8 m/s and helped the team to rank second at the 2019 AlphaPilot Challenge.
{style="text-align: justify;"}

