"""
A python script for the post of "From Information Theory to Variational Inference"
"""
import seaborn as sns
import matplotlib.pyplot as plt
import matplotlib.mlab as mlab
import numpy as np
plt.style.use('ggplot')

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

fig, ax = plt.subplots(1,1)
mu = 0
variance = 1
sigma = np.sqrt(variance)
x = np.linspace(mu-12*sigma, mu+12*sigma, 100)
ax.plot(x, mlab.normpdf(x, mu, sigma))
ax.plot(x, mlab.normpdf(x, mu, 2*sigma))
ax.plot(x, mlab.normpdf(x, mu, 4*sigma))
plt.show()
