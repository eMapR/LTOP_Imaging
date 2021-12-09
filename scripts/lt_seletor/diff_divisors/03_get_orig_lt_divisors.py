import sys
import os
import pandas as pd
import numpy as np

csv_path_list = '/vol/v1/proj/SERVIR/LTOP_Imaging/03_lt_selector/LTOP_cambodia_selected_config_4parts.csv'

# df = pd.read_csv
outfile = '/vol/v1/proj/SERVIR/LTOP_Imaging/03_lt_selector/csv_divisors/LTOP_cambodia_config_lt_orig_divisors.csv'

df = pd.read_csv(csv_path_list)

df_orig = df.query("paramNum == 64 and index == 'NBR'")

df_orig['selected'] = 111 

df_orig.to_csv(outfile,index=False)

sys.exit()

