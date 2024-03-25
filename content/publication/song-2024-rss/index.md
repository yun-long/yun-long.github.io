---
title: 'Learning Quadruped Locomotion Using Differentiable Simulation'

# Authors
# If you created a profile for a user (e.g. the default `admin` user), write the username (folder name) here
# and it will be replaced with their full name and linked to their profile.
authors:
  - admin
  - Sangbae Kim
  - Davide Scaramuzza

# # Author notes (optional)
# author_notes:
#   - 'Equal contribution'
#   - 'Equal contribution'

date: '2024-02-08'
doi: ''

# Schedule page publish date (NOT publication's date).
publishDate: '2024-02-08'

# Publication type.
# Accepts a single type but formatted as a YAML list (for Hugo requirements).
# Enter a publication type from the CSL standard.
publication_types: ['conference']

# Publication name and optional abbreviated publication name.
publication: In Under Reivew
publication_short: In Under Review

abstract: While most recent advancements in legged robot control have been driven by model-free reinforcement learning, we explore the potential of differentiable simulation. Differentiable simulation promises faster convergence and more stable training by computing low-variant first-order gradients using the robot model, but so far, its use for legged robot control has remained limited to simulation. The main challenge with differentiable simulation lies in the complex optimization landscape of robotic tasks due to discontinuities in contact-rich environments, e.g., quadruped locomotion. This work proposes a new, differentiable simulation framework to overcome these challenges. The key idea involves decoupling the complex whole-body simulation, which may exhibit discontinuities due to contact, into two separate continuous domains. Subsequently, we align the robot state resulting from the simplified model with a more precise, non-differentiable simulator to maintain sufficient simulation accuracy. Our framework enables learning quadruped walking in minutes using a single simulated robot without any parallelization. When augmented with GPU parallelization, our approach allows the quadruped robot to master diverse locomotion skills, including trot, pace, bound, and gallop, on challenging terrains in minutes. Additionally, our policy achieves robust locomotion performance in the real world zero-shot. To the best of our knowledge, this work represents the first demonstration of using differentiable simulation for controlling a real quadruped robot. This work provides several important insights into using differentiable simulations for legged locomotion in the real world.

# Summary. An optional shortened abstract.
summary: The first demonstration of using differentiable simulation for controlling a real quadruped robot. An exciting paper coming soon. 

tags: []

# Display this page in the Featured widget?
featured: true

# Custom links (uncomment lines below)
# links:
# - name: Custom Link
#   url: http://example.org

url_pdf: 'https://arxiv.org/abs/2403.14864'
url_code: ''
url_dataset: ''
url_poster: ''
url_project: ''
url_slides: ''
# url_source: 'https://github.com/HugoBlox/hugo-blox-builder'
url_video: ''

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder.
image:
  caption: ''
  focal_point: ''
  preview_only: false

# Associated Projects (optional).
#   Associate this publication with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `internal-project` references `content/project/internal-project/index.md`.
#   Otherwise, set `projects: []`.
projects:
  - 

# Slides (optional).
#   Associate this publication with Markdown slides.
#   Simply enter your slide deck's filename without extension.
#   E.g. `slides: "example"` references `content/slides/example/index.md`.
#   Otherwise, set `slides: ""`.
slides: 
---
<!-- 
{{% callout note %}}
Click the _Cite_ button above to demo the feature to enable visitors to import publication metadata into their reference management software.
{{% /callout %}}

{{% callout note %}}
Create your slides in Markdown - click the _Slides_ button to check out the example.
{{% /callout %}}

Add the publication's **full text** or **supplementary notes** here. You can use rich formatting such as including [code, math, and images](https://docs.hugoblox.com/content/writing-markdown-latex/). -->
