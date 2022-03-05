 //######################################################################################################## 
//#                                                                                                    #\\
//#                                         LANDTRENDR LIBRARY                                         #\\
//#                                                                                                    #\\
//########################################################################################################


// date: 2020-12-10
// author: Peter Clary    | clarype@oregonstate.edu
//         Robert Kennedy | rkennedy@coas.oregonstate.edu
// website: https://github.com/eMapR/LT-GEE

//  This program takes a dataset of independent patches of pixels and links patches that are spectrally 
//  similar. The independent patches are derived from a SNIC algorithm, which groups pixels around a seed 
//  pixel that is spectrally similar. These patches are then linked using a K-Means clustering algorithm. 
//  In essence, we are putting the patches into clusters; like sorting clusters of different colored grapes. 
//  Each of the clusters is given a unique cluster ID so we can keep track of them.

var geometry = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-124.26680212417426, 45.020277044589896],
          [-124.26680212417426, 44.27581082711985],
          [-121.06428747573676, 44.27581082711985],
          [-121.06428747573676, 45.020277044589896]]], null, false);

//////////////////////////////////////////////////////////
//////////////////Import Modules ////////////////////////////
////////////////////////// /////////////////////////////

var ltgee = require('users/emaprlab/public:Modules/LandTrendr.js'); 

//////////////////////////////////////////////////////////
/////////////////point sample ////////////////////////////
///////////////////////////////////////////////////////

var sample = ee.FeatureCollection("users/clarype/ltop_snic_seed_polygon_centroids_sample_75k_att_noNull");
Map.addLayer(sample)
//////////////////////////////////////////////////////////
/////////////////////Cambodia vector////////////////////////////
////////////////////////// /////////////////////////////

//Centers the map on spatial features 
var table = ee.FeatureCollection(geometry);
var aoi = table.geometry().buffer(5000);

//////////////////////////////////////////////////////////
////////////////////params//////////////////////////
////////////////////////// /////////////////////////////

var startDate = '04-20'; 
var endDate =   '09-10'; 
var masked = ['cloud', 'shadow'] // Image masking options ie cloud option tries to remove clouds from the imagery. powermask in new and has magic powers ... RETURN TO THIS AND ADD MORE DETAIL

/////////////////////////////////////////////////////////
////////////////////////Landsat Composites///////////////////////////////
/////////////////////////////////////////////////////////

var image2020 = ltgee.buildSRcollection(2020, 2020, startDate, endDate, aoi, masked).mosaic()
var image2010 = ltgee.buildSRcollection(2000, 2000, startDate, endDate, aoi, masked).mosaic()
var image2000 = ltgee.buildSRcollection(1990, 1990, startDate, endDate, aoi, masked).mosaic()

var LandsatComposites = image2020.addBands(image2010).addBands(image2000)

//////////////////////////////////////////////////////////
////////////////////SNIC/////////////////////////////
///////////////////////////////////////////////////////

var snicImagey = ee.Algorithms.Image.Segmentation.SNIC({
  image: LandsatComposites,
  size: 5, //changes the number and size of patches 
  compactness: 1, //degrees of irregularity of the patches from a square 
  }).clip(aoi);
  
//////////////////////////////////////////////////////////
////////////////////SNIC/////////////////////////////
///////////////////////////////////////////////////////

var patchRepsMean = snicImagey.select(["seeds", "clusters",  "B1_mean", "B2_mean",  "B3_mean",  "B4_mean",  "B5_mean",  "B7_mean",  "B1_1_mean",  "B2_1_mean",  "B3_1_mean",  "B4_1_mean",  "B5_1_mean","B7_1_mean",  "B1_2_mean",  "B2_2_mean",  "B3_2_mean",  "B4_2_mean",  "B5_2_mean",  "B7_2_mean"]);

var patchRepSeeds = snicImagey.select(['seeds']);

///////////////////////////////////////////////////////
///////Select singel pixel from each patch/////////////
///////////////////////////////////////////////////////

var SNIC_means_seed_image = patchRepSeeds.multiply(patchRepsMean).select(["B1_mean", "B2_mean",  "B3_mean",  "B4_mean",  "B5_mean",  "B7_mean",  "B1_1_mean",  "B2_1_mean",  "B3_1_mean",  "B4_1_mean",  "B5_1_mean","B7_1_mean",  "B1_2_mean",  "B2_2_mean",  "B3_2_mean",  "B4_2_mean",  "B5_2_mean",  "B7_2_mean"],["seed_3",  "seed_4",  "seed_5",  "seed_6",  "seed_7",  "seed_8",  "seed_9",  "seed_10",  "seed_11",  "seed_12","seed_13",  "seed_14",  "seed_15",  "seed_16",  "seed_17",  "seed_18",  "seed_19", "seed_20"])//.reproject({  crs: 'EPSG:4326',  scale: 30});//.clip(aoi)
var SNIC_means_image = patchRepsMean.select(["B1_mean", "B2_mean",  "B3_mean",  "B4_mean",  "B5_mean",  "B7_mean",  "B1_1_mean",  "B2_1_mean",  "B3_1_mean",  "B4_1_mean",  "B5_1_mean","B7_1_mean",  "B1_2_mean",  "B2_2_mean",  "B3_2_mean",  "B4_2_mean",  "B5_2_mean",  "B7_2_mean"],["seed_3",  "seed_4",  "seed_5",  "seed_6",  "seed_7",  "seed_8",  "seed_9",  "seed_10",  "seed_11",  "seed_12","seed_13",  "seed_14",  "seed_15",  "seed_16",  "seed_17",  "seed_18",  "seed_19", "seed_20"]).toInt32()//.reproject({  crs: 'EPSG:4326',  scale: 30});//.clip(aoi)

//////////////////////////////////////////////////////////
/////////////////Train////////////////////////////
///////////////////////////////////////////////////////

var training = ee.Clusterer.wekaCascadeKMeans(5000,5001).train({ 
  features: sample, 
  //real names:["B1_mean", "B2_mean",  "B3_mean",  "B4_mean",  "B5_mean",  "B7_mean",  "B1_1_mean",  "B2_1_mean",  "B3_1_mean",  "B4_1_mean",  "B5_1_mean","B7_1_mean",  "B1_2_mean",  "B2_2_mean",  "B3_2_mean",  "B4_2_mean",  "B5_2_mean",  "B7_2_mean"]
  inputProperties:["seed_3",  "seed_4",  "seed_5",  "seed_6",  "seed_7",  "seed_8",  "seed_9",  "seed_10",  "seed_11",  "seed_12","seed_13",  "seed_14",  "seed_15",  "seed_16",  "seed_17",  "seed_18",  "seed_19", "seed_20"]
});

////////////////////////////////////////
////////////////////Clusterer//////////////
////////////////////////////////////////

var clusterSeed = SNIC_means_image.cluster(training).clip(aoi);
var kmeans_seed = clusterSeed
////////////////////////////////////
////////////////Kmeans cluster Export//////////////
////////////////////////////////////

Export.image.toDrive({
        image:kmeans_seed, 
        description: 'ltop_snic_seed_points75k_kmeans_5k_cluster_seedimage', 
        folder:'ltop_snic_seed_points75k_kmeans_5k_cluster_seedimage', 
        fileNamePrefix: "ltop_snic_seed_points75k_kmeans_5k_cluster_seedimage", 
        region:aoi, 
        scale:30, 
        maxPixels: 1e13 
})   


Export.image.toAsset({image: kmeans_seed, 
            description:"ltop_snic_seed_points75k_kmeans_5k_cluster_image" , 
            assetId:"ltop_snic_seed_points75k_kmeans_5k_cluster_image" , 
            region:aoi, 
            scale:30,
            maxPixels:1e13, 
})


Map.centerObject(aoi)
