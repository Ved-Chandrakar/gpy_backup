const { sequelize, Child, PlantAssignment, PlantPhoto, ReplacementRequest, District, Block, Village } = require('../models');
const { Op } = require('sequelize');

const getStateDashboard = async (req, res) => {
  try {
    // Basic statistics
    const totalMothers = await Child.count({ where: { is_active: true } });
    const totalPlantsDistributed = await PlantAssignment.count({ where: { status: 'active' } });
    const totalPhotosUploaded = await PlantPhoto.count();
    const pendingReplacements = await ReplacementRequest.count({ where: { status: 'pending' } });

    // District-wise statistics
    const districtStats = await sequelize.query(`
      SELECT 
        d.name as district_name,
        COUNT(DISTINCT c.id) as total_mothers,
        COUNT(DISTINCT pa.id) as total_plants,
        COUNT(DISTINCT pp.id) as total_photos,
        COUNT(DISTINCT rr.id) as replacement_requests
      FROM District d
      LEFT JOIN Child c ON d.id = c.district_id AND c.is_active = 1
      LEFT JOIN PlantAssignment pa ON c.id = pa.child_id AND pa.status = 'active'
      LEFT JOIN PlantPhoto pp ON pa.id = pp.assignment_id
      LEFT JOIN ReplacementRequest rr ON pa.id = rr.assignment_id
      GROUP BY d.id, d.name
      ORDER BY d.name
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    // Monthly registration trends
    const monthlyTrends = await sequelize.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as registrations
      FROM Child
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    // Plant health statistics
    const plantHealthStats = await sequelize.query(`
      SELECT 
        health_status,
        COUNT(*) as count
      FROM PlantPhoto pp
      INNER JOIN (
        SELECT assignment_id, MAX(upload_date) as latest_date
        FROM PlantPhoto
        GROUP BY assignment_id
      ) latest ON pp.assignment_id = latest.assignment_id AND pp.upload_date = latest.latest_date
      GROUP BY health_status
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      message: 'State dashboard data retrieved successfully',
      data: {
        overview: {
          total_mothers: totalMothers,
          total_plants_distributed: totalPlantsDistributed,
          total_photos_uploaded: totalPhotosUploaded,
          pending_replacements: pendingReplacements
        },
        district_statistics: districtStats,
        monthly_trends: monthlyTrends,
        plant_health_stats: plantHealthStats
      }
    });
  } catch (error) {
    console.error('Get state dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getDistrictDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    const districtId = parseInt(id);

    // Check if district exists
    const district = await District.findByPk(districtId);
    if (!district) {
      return res.status(404).json({
        success: false,
        message: 'District not found'
      });
    }

    // Basic statistics for the district
    const totalMothers = await Child.count({ 
      where: { 
        district_id: districtId, 
        is_active: true 
      } 
    });

    const totalPlantsDistributed = await PlantAssignment.count({
      include: [{
        model: Child,
        as: 'child',
        where: { district_id: districtId }
      }],
      where: { status: 'active' }
    });

    const totalPhotosUploaded = await PlantPhoto.count({
      include: [{
        model: PlantAssignment,
        as: 'assignment',
        include: [{
          model: Child,
          as: 'child',
          where: { district_id: districtId }
        }]
      }]
    });

    const pendingReplacements = await ReplacementRequest.count({
      include: [{
        model: PlantAssignment,
        as: 'assignment',
        include: [{
          model: Child,
          as: 'child',
          where: { district_id: districtId }
        }]
      }],
      where: { status: 'pending' }
    });

    // Block-wise statistics
    const blockStats = await sequelize.query(`
      SELECT 
        b.name as block_name,
        COUNT(DISTINCT c.id) as total_mothers,
        COUNT(DISTINCT pa.id) as total_plants,
        COUNT(DISTINCT pp.id) as total_photos,
        COUNT(DISTINCT rr.id) as replacement_requests
      FROM Block b
      LEFT JOIN Child c ON b.id = c.block_id AND c.district_id = ? AND c.is_active = 1
      LEFT JOIN PlantAssignment pa ON c.id = pa.child_id AND pa.status = 'active'
      LEFT JOIN PlantPhoto pp ON pa.id = pp.assignment_id
      LEFT JOIN ReplacementRequest rr ON pa.id = rr.assignment_id
      WHERE b.district_id = ?
      GROUP BY b.id, b.name
      ORDER BY b.name
    `, {
      replacements: [districtId, districtId],
      type: sequelize.QueryTypes.SELECT
    });

    // Recent activities
    const recentActivities = await sequelize.query(`
      SELECT 
        'photo_upload' as activity_type,
        pp.upload_date as activity_date,
        c.mother_name,
        p.name as plant_name,
        pp.health_status
      FROM PlantPhoto pp
      JOIN PlantAssignment pa ON pp.assignment_id = pa.id
      JOIN Child c ON pa.child_id = c.id
      JOIN Plant p ON pa.plant_id = p.id
      WHERE c.district_id = ?
      ORDER BY pp.upload_date DESC
      LIMIT 20
    `, {
      replacements: [districtId],
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      message: 'District dashboard data retrieved successfully',
      data: {
        district_info: district,
        overview: {
          total_mothers: totalMothers,
          total_plants_distributed: totalPlantsDistributed,
          total_photos_uploaded: totalPhotosUploaded,
          pending_replacements: pendingReplacements
        },
        block_statistics: blockStats,
        recent_activities: recentActivities
      }
    });
  } catch (error) {
    console.error('Get district dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getSummaryStats = async (req, res) => {
  try {
    const userRole = req.user.role.name;
    let whereClause = {};

    // Apply filters based on user role
    if (userRole === 'hospital') {
      whereClause = { hospital_id: req.user.id };
    } else if (userRole === 'collector') {
      whereClause = { district_id: req.user.district_id };
    } else if (userRole === 'mitanin') {
      whereClause = { assigned_mitanin_id: req.user.id };
    }

    const totalMothers = await Child.count({ 
      where: { ...whereClause, is_active: true } 
    });

    const totalPlantsDistributed = await PlantAssignment.count({
      include: [{
        model: Child,
        as: 'child',
        where: whereClause
      }],
      where: { status: 'active' }
    });

    const totalPhotosUploaded = await PlantPhoto.count({
      include: [{
        model: PlantAssignment,
        as: 'assignment',
        include: [{
          model: Child,
          as: 'child',
          where: whereClause
        }]
      }]
    });

    const pendingReplacements = await ReplacementRequest.count({
      include: [{
        model: PlantAssignment,
        as: 'assignment',
        include: [{
          model: Child,
          as: 'child',
          where: whereClause
        }]
      }],
      where: { status: 'pending' }
    });

    res.json({
      success: true,
      message: 'Summary statistics retrieved successfully',
      data: {
        total_mothers: totalMothers,
        total_plants_distributed: totalPlantsDistributed,
        total_photos_uploaded: totalPhotosUploaded,
        pending_replacements: pendingReplacements
      }
    });
  } catch (error) {
    console.error('Get summary stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getStateDashboard,
  getDistrictDashboard,
  getSummaryStats
};
