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

//######################################################################################################## 
//#                                                                                                    #\\
//#                                         LANDTRENDR LIBRARY                                         #\\
//#                                                                                                    #\\
//########################################################################################################


// date: 2020-12-10
// author: Peter Clary    | clarype@oregonstate.edu
//         Robert Kennedy | rkennedy@coas.oregonstate.edu
// website: https://github.com/eMapR/LT-GEE


//  This program takes a raster stack of images and constellates pixels that are spectrally similar around a 
//  seed pixel. The rasters used are harmized landsat images for a given date window in a year over a yearly 
//  time series.   
//

//////////////////////////////////////////////////////////
//////////////////Import Modules ////////////////////////////
////////////////////////// /////////////////////////////

var ltgee = require('users/emaprlab/public:Modules/LandTrendr.js'); 

//////////////////////////////////////////////////////////
///////////////////// vector////////////////////////////
////////////////////////// /////////////////////////////

var table = ee.FeatureCollection(geometry);

//Centers the map on spatial features 
var aoi = table.geometry().buffer(5000);
Map.centerObject(aoi)
Map.addLayer(aoi)

//////////////////////////////////////////////////////////
//////////////////// time and mask params//////////////////////////
////////////////////////// /////////////////////////////

var startYear = 1990; 
var endYear = 2020; 
var startDate = '04-20'; 
var endDate =   '09-10'; 
var masked = ['cloud', 'shadow', 'snow'] // Image masking options ie cloud option tries to remove clouds from the imagery. powermask in new and has magic powers ... RETURN TO THIS AND ADD MORE DETAIL

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
  
Map.addLayer(snicImagey,{"opacity":1,"bands":["B3_mean","B2_mean","B1_mean"],"min":242.47874114990233,"max":962.1856112670898,"gamma":1},'snicImagey1')

//////////////////////////////////////////////////////////
//////////////SNIC split by bands////////////////////////
///////////////////////////////////////////////////////

var patchRepsMean = snicImagey.select(["seeds","clusters",  "B1_mean", "B2_mean",  "B3_mean",  "B4_mean",  "B5_mean",  "B7_mean",  "B1_1_mean",  "B2_1_mean",  "B3_1_mean",  "B4_1_mean",  "B5_1_mean","B7_1_mean",  "B1_2_mean",  "B2_2_mean",  "B3_2_mean",  "B4_2_mean",  "B5_2_mean",  "B7_2_mean"]);

var patchRepSeeds = snicImagey.select(['seeds']);

///////////////////////////////////////////////////////
///////Select singel pixel from each patch/////////////
///////////////////////////////////////////////////////

var seeds_with_snic_values = patchRepSeeds.multiply(patchRepsMean)//.reproject({  crs: 'EPSG:4326',  scale: 30});//.clip(aoi)

Map.addLayer(seeds_with_snic_values,{"opacity":1,"bands":["B3_mean","B2_mean","B1_mean"],"min":242.47,"max":962.18,"gamma":1},'seeds_with_snic_values')

// //////////////////////////////////
// //////////////Export SNIC/////////
// //////////////////////////////////

// the whole SNIC image is not needed 
// Export.image.toDrive({
//         image:snicImagey.toInt32().clip(aoi), 
//         description: 'SNIC_image', 
//         folder:'SNIC_image', 
//         fileNamePrefix: "SNIC_image", 
//         region:aoi, 
//         scale:30, 
//         maxPixels: 1e13 
//       })     
      
// export seed pixels with SNIC band values
Export.image.toDrive({
        image:seeds_with_snic_values.toInt32().clip(aoi), //int 32 is for the cluster ids ... Do we need them? 
        description: 'SNICseed_v1', 
        folder:'ltop_SNIC_v1', 
        fileNamePrefix: "SNICseed_v1", 
        region:aoi, 
        scale:30, 
        maxPixels: 1e13 
      })   



