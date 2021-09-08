### LTOP Overview

LandTrendr is a set of spectral-temporal segmentation algorithms that focuses on removing the natural spectral variations in a time series of Landsat Images. Stabling the natural variation in a time series, gives emphasis on how a landscape is evolving with time. This is useful in many pursuits as it gives information on the state of a landscape, be it growing, remaining stable, or on a decline. LandTrendr is mostly used in Google Earth Engine (GEE), an online image processing console, where it is readily available for use.  

A large obstacle in using LandTrendr in GEE, is knowing which configuration of LandTrendr parameters to use. The LandTrendr GEE function uses 9 arguments: 8 parameters that control how spectral-temporal segmentation is executed, and an annual image collection on which to assess and remove the natural variations. The original LandTrendr journal illustrates the effect and sensitivity of changing some of these values. The default parameters for the LandTrendr GEE algorithm do a satisfactory job in many circumstances, but extensive testing and time is needed to hone the parameter selection to get the best segmentation out of the LandTrendr algorithm for a given region. Thus, augmenting the Landtrendr parameter selection process would save time and standardize a method to choose parameters, but we also aim to take this augmentation a step further. 

Traditionally, LandTrendr is run over an image collection with a single LandTrendr parameter configuration and is able to remove natural variation for every pixel time series in an image. But no individual LandTrendr parameter configuration is best for all surface conditions, where forest may respond well to one configuration, but many under or over emphasize stabilization in another land class. Thus here we aim to delineate patches of spectrally similar pixels from the imagery, find what LandTrendr parameters work best for each patch group, and run LandTrendr on each patch group location with that best parameter configuration. 

### LTOP WorkFlow (Step by Step) 

[GEE link](https://code.earthengine.google.com/https://code.earthengine.google.com/?accept_repo=users/emaprlab/SERVIR) open with Emapr Account for dependencies 

![img](https://lh4.googleusercontent.com/qpYv4_Q9InR0_LBzk1vdtIWhfLmMRNwZ840DSv6h0CzETzPjd2n6pgQP24eiHFQLfTKp3Tr17yLoqwdRfPeNb_YyktC60kTGnQulL7UwiLoQit-OyJJ3H_vI25-GE06J20ab_YeO=s0)

#### 1 Run 01SNICPatches in GEE to generate SNIC images

	1. Open script in GEE console 
	
	2. Make sure you all needed dependances (emapr GEE account has all dependances) 

	3. Review in script parameters. Lines 35-39, lines 47-49 (SNIC years), lines 83,84 (SNIC)

	4. Run script (01SNICPatches)

	5. Run tasks

#### 2 Getting data  from the Google drive to Islay

	1. Open terminal on Islay in a VNC

	2. Activate conda environment “py35”

		conda activate py35

	1. This script bring data from the google drive to Islay 

		/vol/v1/proj/SERVIR/v2_revision/LandTrendrOptimization/GEEjs/1_get_chunks_from_gdrive.py

	1. Run script 

		python /vol/v1/proj/SERVIR/v2_revision/LandTrendrOptimization/GEEjs/1_get_chunks_from_gdrive.py CambodiaSNIC_v6 /vol/v1/proj/SERVIR/v2_revision/rasters/SNIC_imagery/gee/


	1. Check data at download destination. 

		/vol/v1/proj/LTOP_Oregon/rasters/01_SNIC/

#### 3 Merge image chunks into two vrt 

	1. Activate conda environment

		a) conda activate gdal37

	2. Build VRT SNIC seed image 

		a) make text file of file path is folder (only tiffs in the folder)
	
			ls -d "$PWD"/* > listOfTiffs.txt

		b) build vrt raster with text file 

			gdalbuildvrt snic_seed.vrt -input_file_list listOfTiffs.txt

	3. Build VRT SNIC image 

		a) make text file of file path is folder (only tiffs in the folder)

			ls -d "$PWD"/* > listOfTiffs.txt

		b) build vrt raster with text file 

			gdalbuildvrt snic_image.vrt -input_file_list listOfTiffs.txt


	4. Inspect and process the merged imagery.

		a) Data location:

			/vol/v1/proj/LTOP_Oregon/rasters/01_SNIC/snic_seed.vrt

			/vol/v1/proj/LTOP_Oregon/rasters/01_SNIC/snic_image.vrt			


#### 4 Raster calc clipped seed image to keep only seed pixels (QGIS)

	1. Raster calculation (("seed_band">0)*"seed_band") / (("seed_band">0)*1 + ("seed_band"<=0)*0)

	2. Input:

		/vol/v1/proj/LTOP_Oregon/rasters/01_SNIC/snic_seed.vrt

	3. Output: 	

		/vol/v1/proj/LTOP_Oregon/rasters/01_SNIC/snic_seed_pixels.tif

	Note: 
		This raster calculation change the 0 pixel values to no data in Q-gis. However, this also 
		changes a seed id pixel to no data aswell. But one out of hundreds of millions pixels is 
		inconsequential.



#### 5 **Change the** ***raster calc clipped seed image*** **to a vector of points. Each point corresponds to a seed pixel. (QGIS)**

	1. Qgis tool - Raster pixels to points 
  	 

	2. Input

		/vol/v1/proj/LTOP_Oregon/rasters/01_SNIC/snic_seed_pixels.tif

	3. Output

		/vol/v1/proj/LTOP_Oregon/vectors/01_SNIC/01_snic_seed_pixel_points/01_snic_seed_pixel_points.shp


#### 6 **Sample ALL points from above image with shp file (QGIS - Sample Raster Values ~3362.35 secs)**

	1. Input point layer

		/vol/v1/proj/LTOP_Oregon/vectors/01_SNIC/01_snic_seed_pixel_points/01_snic_seed_pixel_points.shp

	2. Raster layer 

		/vol/v1/proj/LTOP_Oregon/rasters/01_SNIC/snic_seed.vrt

	3. Output column prefix

		seed_

	4. Output location 

		/vol/v1/proj/LTOP_Oregon/vectors/01_SNIC/02_snic_seed_pixel_points_attributted/02_snic_seed_pixel_points_attributted.shp


#### 7 **Randomly select a subset of points 75k (QGIS - Random selection within subsets)**

	1. Input

		/vol/v1/proj/LTOP_Oregon/vectors/01_SNIC/02_snic_seed_pixel_points_attributted/02_snic_seed_pixel_points_attributted.shp

	2. Number of selection 

		75000 

		Note: the value above is arbitrary

	3. Save selected features as:

 		/vol/v1/proj/LTOP_Oregon/vectors/01_SNIC/03_snic_seed_pixel_points_attributted_random_subset_75k/03_snic_seed_pixel_points_attributted_random_subset_75k.shp


#### 8 **Upload sample to gee** 

	1. Zip shape file 

		zip -r 03_snic_seed_pixel_points_attributted_random_subset_75k.zip 03_snic_seed_pixel_points_attributted_random_subset_75k/ 

	2. Up load to GEE as asset

	3. GEE Asset location 

		users/emaprlab/03_snic_seed_pixel_points_attributted_random_subset_75k




#### 9 Kmeans of SNIC

	1. Run GEE Kmeans on SNIC image with training data from 03_snic_seed_pixel_points_attributted_random_subset_75k.shp

		5000 clusters

	2. Run GEE Kmeans on SNIC seed image with training data from 03_snic_seed_pixel_points_attributted_random_subset_75k.shp

		5000 clusters



#### 10 **Export KMeans image to islay** 

	1. Run script 1_get_chunks_from_gdrive.py

		(py35) python 1_get_chunks_from_gdrive.py LTOP_Oregon_Kmeans_v1 /vol/v1/proj/LTOP_Oregon/rasters/02_Kmeans/gee/





#### 11 **Merge GEE tiff chunks** 

	2. 1. Location

		/vol/v1/proj/LTOP_Oregon/rasters/02_Kmeans/gee

	1. Image 

		gdal_merge.py *.tif -o ../LTOP_Oregon_Kmeans_cluster_image.tif


#### 12 **Sample Kmeans raster** (QGIS - Sample Raster Values)

	1. Qgis (TOOL: Sample Raster Values)

		a)Input 

			/vol/v1/proj/LTOP_Oregon/rasters/02_Kmeans/LTOP_Oregon_Kmeans_cluster_image.tif

			/vol/v1/proj/LTOP_Oregon/vectors/01_SNIC/01_snic_seed_pixel_points/01_snic_seed_pixel_points.shp

		b) Output column prefix

			cluster_id

		c) output

			/vol/v1/proj/LTOP_Oregon/vectors/02_Kmeans/LTOP_Oregon_Kmeans_Cluster_IDs.shp




#### 13 **Get single point for each cluster**

	1) location

		/vol/v1/proj/LTOP_Oregon/scripts/kMeanClustering/randomDistinctSampleOfKmeansClusterIDs_v2.py

	2) Edit in script parameters  

		a) input shp file:

			/vol/v1/proj/LTOP_Oregon/vectors/02_Kmeans/LTOP_Oregon_Kmeans_Cluster_IDs/LTOP_Oregon_Kmeans_Cluster_IDs.shp

		b) output shp file:

			/vol/v1/proj/LTOP_Oregon/vectors/02_Kmeans/LTOP_Oregon_Kmeans_Cluster_ID_reps/LTOP_Oregon_Kmeans_Cluster_IDs.shp

	3) conda 

		conda activate geo_env

	4) run script


#### 14 Upload SHP file of 5000 Kmeans cluster IDs points to GEE

	1) location 

		/vol/v1/proj/LTOP_Oregon/vectors/02_Kmeans/
	
	2) zip folder 

		zip -r LTOP_Oregon_Kmeans_Cluster_ID_reps.zip LTOP_Oregon_Kmeans_Cluster_ID_reps/

	3) upload to GEE 

		users/emaprlab/LTOP_Oregon_Kmeans_Cluster_ID_reps

#### 15 **Abstract sample of Landsat Collections with 5000 Kmeans cluster reps** (GEE)

	1) Edit/Review parameters in 03abstractSampler.js

	2) Run 03abstractSampler.js in GEE

	3) output

		LTOP_Oregon_Abstract_Sample_annualSRcollection_Tranformed_NBRTCWTCGNDVIB5_v1.csv		

#### 16 Download CSV from Google Drive

	1) Download

		LTOP_Oregon_Abstract_Sample_annualSRcollection_Tranformed_NBRTCWTCGNDVIB5_v1.csv

	2) location (islay)

		/vol/v1/proj/LTOP_Oregon/tables/abstract_sample_gee


#### 17 Create Abstract image with CSV (python) 

	1) Input

		/vol/v1/proj/LTOP_Oregon/tables/abstract_sample_gee/LTOP_Oregon_Abstract_Sample_annualSRcollection_Tranformed_NBRTCWTCGNDVIB5_v1.csv

	2) Outputs

		a) image directory

			/vol/v1/proj/LTOP_Oregon/rasters/03_AbstractImage/

		b) SHP directory

			/vol/v1/proj/LTOP_Oregon/vectors/03_abstract_image_pixel_points/

	3) Conda 

		conda activate geo_env

	4) Run Command  

		python csv_to_abstract_images.py



#### 18 Upload rasters to GEE and make image collection

	1) From location

		/vol/v1/proj/LTOP_Oregon/rasters/03_AbstractImage

	2) make folder in GEE asseset to hold all the images 

	3) Upload all images to assest folder 

	4) Make image collection in GEE assets tab

	5) add each abstract image to image collection




#### 19 Upload SHP to GEE

	1) From location

		/vol/v1/proj/LTOP_Oregon/vectors

	2) zip files

		zip -r 03_abstract_image_pixel_points.zip 03_abstract_image_pixel_points/

	3) Upload to GEE 


#### 20 Run Abstract imager for each index 

	1) Edit/Review 

		/vol/v1/proj/LTOP_Oregon/scripts/GEEjs/04abstractImager.js

	2) copy and paste in GEE console

	3) check to make sure runParams pasted correctly (super long list)

	4) run script for each index 'NBR', 'NDVI', 'TCG', 'TCW', 'B5'

		a) editing line 18 to change index name

	5) output folder name 

		LTOP_Oregon_abstractImageSamples_5000pts_v2 

#### 21 Download folder containing CSV‘s one for each index 

	1) script location 

		/vol/v1/proj/LTOP_Oregon/scripts/GEEjs/

	2) Run Command 

		conda activate py35

		python 1_get_chunks_from_gdrive.py LTOP_Oregon_abstractImageSamples_5000pts_v2 /vol/v1/proj/LTOP_Oregon/tables/LTOP_Oregon_Abstract_Image_LT_data/

	3) output location 

		/vol/v1/proj/LTOP_Oregon/tables/LTOP_Oregon_Abstract_Image_LT_data/


#### 22 Run LT Parameter Scoring scripts

	1) script locaton

		/vol/v1/proj/LTOP_Oregon/scripts/lt_seletor/ltop_lt_parameter_selector.py 

	2) Edit line 119 as the input directory of csv files

		a) input directory 

			/vol/v1/proj/LTOP_Oregon/tables/LTOP_Oregon_Abstract_Image_LT_data/


	3) Edit line 653 as the output csv file

		a) output line 563

			/vol/v1/proj/LTOP_Oregon/tables/LTOP_Oregon_selected_config/LTOP_Oregon_selected_config.csv

	4) run script

		conda activate geo_env

		python /vol/v1/proj/LTOP_Oregon/scripts/lt_seletor/ltop_lt_parameter_selector.py



13. Upload LTOP selected csv to GEE
13. Upload kmeans cluster image to GEE

14. 1. …

15. Run GEE …

16. 1. ...

