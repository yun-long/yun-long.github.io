---
layout: post
title: Radial Basis Function Network
date: 2017-11-29
tag: Machine Learning
use_math: True
---
<img src="/images/posts/MachineLearning/rbfn.png" height="500" width="500">

### Radial Basis Function Network

Radial basis function (RBF) networks typical have three layers: an input layer, a hidden layer with a non-linear RBF activation function and a linear output layer. The input can be modeled as a vector of real number $\mathbf{x} \in \mathbb{R}^n$. The output of the network is then a scalar function of the input vector, $\mathbf{\varphi}: \mathbb{R}^n \rightarrow \mathbb{R}$, and is given by

\begin{equation}
\mathbf{\varphi(x)} = \sum_{i=k}^{K} \omega_k \text{exp}(-\gamma \left \|| \mathbf{x} - \mathbf{\mu_k} \right \||^2)
\end{equation}


Let's take a look at the equation above. In the radial basis function, there are $\mathbf{K}$ parameters, $\omega_i, ... \omega_K$ based on $N$ data points, $x_1, ..., x_N$, and $\mathbf{K}$ center points, $\mu_i, ... \mu_K$, $\mathbf{K} \ll \mathbf{N}$. The problem is how to choose the centers $\mathbf{\mu_k}$ and the weights $\mathbf{\omega_k}$.

**Choosing the centers**

 Use K-means. 

{% highlight python %}
def calculate_centers(self, X):
    """
    calculate the centers of the radial basis function
    :param X: shape (num_data_samples, input_shape)
    :return: 
    """
    kmeans = KMeans(n_clusters=self.hidden_shape, random_state=0).fit(X)
    centers = kmeans.cluster_centers_
    return centers
{% endhighlight%}

 **Choosing the weights**


<img src="/images/posts/MachineLearning/choosingweights.png" height="431" width="765">  

{% highlight python %}
def calculate_interpolation_matrix(self, X):
    G = np.zeros((X.shape[0], self.hidden_shape))
    for i, data_poit in enumerate(X):
        for j, center in enumerate(self.centers):
            G[i, j] = self.gausian_kernel_function(center, data_poit)
    return G

def fit(self, X, y):
    self.centers = self.calculate_centers(X)
    G = self.calculate_interpolation_matrix(X)
    self.weights = np.dot(np.linalg.pinv(G), y)

def predict(self, X):
    G = self.calculate_interpolation_matrix(X)
    return np.dot(G, self.weights)
{% endhighlight%}

### Features

The features are 

\begin{equation}
\text{exp}(-\gamma \left \||  \mathbf{x-\mu_k} \right \||^2)
\end{equation}


{% highlight python %}
def gausian_kernel_function(self, center, data_point):
    return np.exp(-self.beta * np.square(data_point - center))
{% endhighlight%}


It measures the exponential distances between the data points $\mathbf{x}$ and centers $\mathbf{\mu_k}$. Suppose there is a data point $x=10$ and three center points $[0,4,9]$, which corresponding to three features $[\phi_0, \phi_1, \phi_2]$. The distances between this point to the centers are $[100, 36, 1]$. Then this point emphasize its feature on the $\phi_2$. 


### Example
We want approximate the function $y=sin(x)$, where data points x is from 0 to 10 of length 1000. As shown below. 

<img src="/images/posts/MachineLearning/sin.png" height="480" width="640" >  

First, we define the number of hidden neurons or the number of basis functions for our radial basis function network as 10. Then we calculate 10 center points for our basis functions by using k-means clustering method. 

<img src="/images/posts/MachineLearning/basis.png" height="480" width="640" >  

Finally, we can approximate the function with our radial basis function network.

<img src="/images/posts/MachineLearning/fit.png" height="480" width="640" >   

However, if we use a small number of basis functions, e.g. 2, the model will be underfitting. 

<img src="/images/posts/MachineLearning/under.png" height="480" width="640" >   

And if we use more basis functions, e.g. 20, then the model will be overfitting. 

***Reference***

1. <a target="_blank" href="https://en.wikipedia.org/wiki/Radial_basis_function_network">  Wikipedia </a>

2. <a target="_blank" href="http://work.caltech.edu/telecourse.html">  Caltech Course </a>
