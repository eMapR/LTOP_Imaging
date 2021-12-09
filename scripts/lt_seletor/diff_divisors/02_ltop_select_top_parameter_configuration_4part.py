import sys
import os
import pandas as pd
import numpy as np

path = '/vol/v1/proj/SERVIR/LTOP_Imaging/03_lt_selector/LTOP_cambodia_selected_config_4parts.csv'

# df = pd.read_csv
outfile = '/vol/v1/proj/SERVIR/LTOP_Imaging/03_lt_selector/LTOP_cambodia_config_selected_4part_1.csv'

def ClusterPointCalc(dframe, clusterPoint_id):

	#print(clusterPoint_id)
	
	# get all the selected for a plot
	these1 = dframe[(dframe['cluster_id']==clusterPoint_id) & (dframe['selected'] >= 101)]
	these2 = dframe[(dframe['cluster_id']==clusterPoint_id) & (dframe['selected'] >= 102)]
	these3 = dframe[(dframe['cluster_id']==clusterPoint_id) & (dframe['selected'] >= 103)]
	these4 = dframe[(dframe['cluster_id']==clusterPoint_id) & (dframe['selected'] >= 104)]
	
	# since there are more than one selected in each plot  we just grab the first 
	firstOfthese1 = these1.head(1)
	firstOfthese2 = these2.head(1)
	firstOfthese3 = these3.head(1)
	firstOfthese4 = these4.head(1)

	out = firstOfthese1.append(firstOfthese2.append(firstOfthese3.append(firstOfthese4)))
	print(out)
	
	return out        


def main():

	df_temp = pd.read_csv(path)

	dfList = []
	
	for i in list(range(5000)):
		
		i = i + 1
		
		newDFpart2 = ClusterPointCalc(df_temp,i)
		print(newDFpart2)
		dfList.append(newDFpart2)
	


	first_df = dfList[0]

	dfList.pop(0)

	result = first_df.append(dfList)
	
	result.to_csv(outfile, index=False)
	
main()
sys.exit()

