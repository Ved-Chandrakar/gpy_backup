const { District, Block, Village } = require('../models');

const getDistricts = async (req, res) => {
  try {
    const districts = await District.findAll({
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      message: 'Districts retrieved successfully',
      data: { districts }
    });
  } catch (error) {
    console.error('Get districts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getBlocksByDistrict = async (req, res) => {
  try {
    const { districtId } = req.params;

    const blocks = await Block.findAll({
      where: { district_id: districtId },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      message: 'Blocks retrieved successfully',
      data: { blocks }
    });
  } catch (error) {
    console.error('Get blocks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getVillagesByBlock = async (req, res) => {
  try {
    const { blockId } = req.params;

    const villages = await Village.findAll({
      where: { block_id: blockId },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      message: 'Villages retrieved successfully',
      data: { villages }
    });
  } catch (error) {
    console.error('Get villages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getDistricts,
  getBlocksByDistrict,
  getVillagesByBlock
};
