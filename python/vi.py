"""
A python script for the post of "From Information Theory to Variational Inference"
"""
import seaborn as sns
import matplotlib.pyplot as plt
import matplotlib.mlab as mlab
import numpy as np
# plt.style.use('ggplot')

# # First plot, discrete probability distribution
# p = [0.25, 0.25, 0.25, 0.25]
# q = [0.25, 0.25, 0.26, 0.24]
# t = [0.6, 0.2, 0.15, 0.05]
# x = np.arange(len(p))

# fig, axes = plt.subplots(1, 3, figsize=(10, 3), sharey=True)
# axes[0].bar(x, p)
# axes[0].set_title("$p(x)$")
# axes[1].bar(x, q)
# axes[1].set_title("$q(x)$")
# axes[2].bar(x, t)
# axes[2].set_title("$t(x)$")
# plt.show()

# # Second plot, norm distribution
# fig, ax = plt.subplots(1,1, figsize=(6, 3))
# mu = 0
# variance = 1
# sigma = np.sqrt(variance)
# x = np.linspace(mu-12*sigma, mu+12*sigma, 100)
# ax.plot(x, mlab.normpdf(x, mu, sigma), label='$p(x) \sim \mathcal{N}(0, 1)$')
# ax.plot(x, mlab.normpdf(x, mu+2, 2*sigma), label='$q(x) \sim \mathcal{N}(2, 2)$')
# # ax.plot(x, mlab.normpdf(x, mu, 4*sigma))
# plt.legend()
# plt.show()

# # Third plot, Jensen's inequality
fig, axes = plt.subplots(1, 2, figsize=(8, 3))
x = np.linspace(0, 10, 100)
y1 = (x - 5)**2
y2 = x + 3
y3 = np.log(x)
y4 = 0.5 * x - 1
axes[0].plot(x, y1)
axes[0].plot(x, y2)
axes[0].axis("off")
axes[0].set_title("Convex")
axes[1].plot(x, y3)
axes[1].plot(x, y4)
axes[1].axis("off")
axes[1].set_title("Concave")
fig.patch.set_visible(False)
plt.show()





















