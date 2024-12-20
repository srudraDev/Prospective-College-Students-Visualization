# Visualization for Prospective Students
Using a dataset of more than 400+ colleges, this D3 visualization tool aims to help prospective college students find the right college. Three types of visualizations are shown due to the vast amount of data surrounding colleges.
- A scatter plot that shows the relationship between admission rates and retention rates after the first year
- A pie chart to show the selected colleges' demographic to determine it's diversity
- A bar chart displaying the amount of median debt of the selected college
  
There's also other features within these visualizations:
- Filter by retention rate minimum (scatter plot)
- Cooperative Brushing and Tooltips for Scatter Plot
    - Tooltip contains more details about the selected college
    - Brushing shows Public vs. Private distribution as percentages
- Tooltip for pie chart
- Dynamic transitions for all charts when changing the selected college
- Dynamic axes to better assist deep exploration
- Static Data

## How to deploy

- Download the corresponding zip file and extract it to a location you can navigate to.
- Start an http server for this project's directory. Assuming you have python installed, do the following:

    From command line, call `python -m http.server 8080` for Python 3 or `python -m SimpleHTTPServer 8080` for Python 2