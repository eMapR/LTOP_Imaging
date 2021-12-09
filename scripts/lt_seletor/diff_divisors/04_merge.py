import sys
import os
import pandas as pd
import numpy as np

csv_path_1 = '/vol/v1/proj/SERVIR/LTOP_Imaging/03_lt_selector/servir_cambodia_ltop_lt_4part.csv'
csv_path_2 = '/vol/v1/proj/SERVIR/LTOP_Imaging/03_lt_selector/LTOP_cambodia_config_selected_4part_1.csv'

# df = pd.read_csv
outfile = '/vol/v1/proj/SERVIR/LTOP_Imaging/03_lt_selector/servir_cambodia_ltop_lt_4part.csv'

df1 = pd.read_csv(csv_path_1)

#df1['selected'] = 111
print(df1)
df2 = pd.read_csv(csv_path_2)
print(df2)

df3 = df1.append(df2)
print(df3)


df3.to_csv(outfile,index=False)

sys.exit()

