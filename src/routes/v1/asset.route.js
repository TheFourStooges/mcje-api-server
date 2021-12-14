const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const upload = require('../../middlewares/multer');
const assetValidation = require('../../validations/asset.validation');
const assetController = require('../../controllers/asset.controller');

const router = express.Router();

// /product
router
  .route('/')
  .post(auth('manageAssets'), upload.single('image'), validate(assetValidation.createAsset), assetController.createAsset)
  .get(validate(assetValidation.getAssets), assetController.getAssets);

// /product/{productId}
router
  .route('/:assetId')
  .get(validate(assetValidation.getAsset), assetController.getAsset)
  .patch(auth('manageAssets'), validate(assetValidation.updateAsset), assetController.updateAsset)
  .delete(auth('manageAssets'), validate(assetValidation.deleteAsset), assetController.deleteAsset);

module.exports = router;
