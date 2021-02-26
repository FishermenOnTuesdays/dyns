import plotly.figure_factory as ff
import plotly.graph_objects as go

import numpy as np

x = np.linspace(-10, 10, 100)
y = np.linspace(-10, 10, 100)
Y, X = np.meshgrid(x, y)
u = 3*Y - 3*X
v = X - 4*Y

# Create streamline figure
fig = ff.create_streamline(x, y, u, v, arrow_scale=.5)
layout = go.Layout(yaxis=dict(scaleanchor="x", scaleratio=1))
fig.layout = layout
fig.show()