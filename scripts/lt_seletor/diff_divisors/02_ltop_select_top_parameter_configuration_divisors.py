import sys
import os
import pandas as pd
import numpy as np

csv_path_list = ['/vol/v1/proj/SERVIR/LTOP_Imaging/03_lt_selector/csv_divisors/LTOP_cambodia_selected_config_divisor03.csv', '/vol/v1/proj/SERVIR/LTOP_Imaging/03_lt_selector/csv_divisors/LTOP_cambodia_selected_config_divisor05.csv', '/vol/v1/proj/SERVIR/LTOP_Imaging/03_lt_selector/csv_divisors/LTOP_cambodia_selected_config_divisor07.csv', '/vol/v1/proj/SERVIR/LTOP_Imaging/03_lt_selector/csv_divisors/LTOP_cambodia_selected_config_divisor15.csv', '/vol/v1/proj/SERVIR/LTOP_Imaging/03_lt_selector/csv_divisors/LTOP_cambodia_selected_config_divisor10.csv', '/vol/v1/proj/SERVIR/LTOP_Imaging/03_lt_selector/csv_divisors/LTOP_cambodia_selected_config_divisor13.csv']

# df = pd.read_csv
outfile = '/vol/v1/proj/SERVIR/LTOP_Imaging/03_lt_selector/csv_divisors/LTOP_cambodia_config_selected_alldivisors.csv'

def ClusterPointCalc(dframe, clusterPoint_id):

	#print(clusterPoint_id)
	
	# get all the selected for a plot
	these = dframe[(dframe['cluster_id']==clusterPoint_id) & (dframe['selected']==101)]
	
	# since there are more than one selected in each plot  we just grab the first 
	firstOfthese = these.head(1)
	
	#print(firstOfthese)
	
	return firstOfthese        


def main():

	#print(ClusterPointCalc(df,2540))

	dfList = []

	# for loop over each csv 
	for path in csv_path_list:

		print(path)
		# read in each csv as a dataframe
		df_temp = pd.read_csv(path)
	
		#get divisor value from path 
		divisor = float(path[-6:-5]+'.'+path[-5:-4])
		
		# add divisor column and value  
		if(divisor == 0.3):

			df_temp['divisor'] = 0.3 
		elif(divisor == 0.5):

			df_temp['divisor'] = 0.5 
		elif(divisor == 0.7):

			df_temp['divisor'] = 0.7 
		elif(divisor == 1.0):

			df_temp['divisor'] = 1.0 
		elif(divisor == 1.3):

			df_temp['divisor'] = 1.3 
		elif(divisor == 1.5):

			df_temp['divisor'] = 1.5 
		

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

