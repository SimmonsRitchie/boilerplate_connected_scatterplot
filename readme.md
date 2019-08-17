### Boilerplate Connected Scatterplot

This is a boilerplate connected scatter plot with a dropdown for changing the displayed data. It was created with D3 and vanilla JS.

Here's a working [example](https://s3.amazonaws.com/dsr-data-viz/2019/boilerplate-chart-bar-horiz-stacked-anno-dynamic/index.html).

### Embed

This map is designed to be embeddable using [pym.js](https://github.com/nprapps/pym.js/). Pym displays the map in an iframe and ensures that the height of the iframe updates as needed.

Here is an example of an embed script that uses pym to display the map:

```
<div id="container"></div>
<script type="text/javascript" src="https://pym.nprapps.org/pym.v1.min.js"></script>
<script>var pymParent = new pym.Parent('container', 'https://s3.amazonaws.com/dsr-data-viz/2019/boilerplate-chart-bar-horiz-stacked-anno-dynamic/index.html', {});</script>
```
