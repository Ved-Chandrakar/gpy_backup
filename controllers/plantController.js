const { PlantAssignment, Plant, Child, User } = require('../models');
const { validateRequest, schemas } = require('../middleware/validation');
const { generateTrackingSchedule } = require('../utils/plantTrackingUtils');

const assignPlants = async (req, res) => {
  try {
    const { child_id, plant_ids } = req.body;

    // Check if child exists
    const child = await Child.findByPk(child_id);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    // Check if plants already assigned to this child
    const existingAssignments = await PlantAssignment.findAll({
      where: {
        child_id,
        status: 'active'
      }
    });

    if (existingAssignments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Plants already assigned to this child'
      });
    }

    // Validate plant IDs
    if (plant_ids.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 plants can be assigned'
      });
    }

    const plants = await Plant.findAll({
      where: {
        id: plant_ids,
        is_active: true
      }
    });

    if (plants.length !== plant_ids.length) {
      return res.status(400).json({
        success: false,
        message: 'Some plants not found or inactive'
      });
    }

    // Create plant assignments
    const assignments = await Promise.all(
      plant_ids.map(plant_id => 
        PlantAssignment.create({
          child_id,
          plant_id,
          assigned_by: req.user.id
        })
      )
    );

    // Generate tracking schedules for each assignment
    const assignedDate = new Date();
    await Promise.all(
      assignments.map(assignment => 
        generateTrackingSchedule(assignment.id, assignedDate)
      )
    );

    // Fetch complete assignment data
    const assignmentIds = assignments.map(a => a.id);
    const completeAssignments = await PlantAssignment.findAll({
      where: { id: assignmentIds },
      include: [
        { model: Plant, as: 'plant', attributes: ['name', 'species', 'category'] },
        { model: Child, as: 'child', attributes: ['mother_name', 'child_name'] },
        { model: User, as: 'assignedBy', attributes: ['name'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Plants assigned successfully',
      data: { assignments: completeAssignments }
    });
  } catch (error) {
    console.error('Assign plants error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during plant assignment'
    });
  }
};

const getPlantAssignments = async (req, res) => {
  try {
    const { child_id, status = 'active' } = req.query;

    let whereClause = { status };

    if (child_id) {
      whereClause.child_id = child_id;
    }

    // Filter based on user role
    if (req.user.role.name === 'hospital') {
      whereClause.assigned_by = req.user.id;
    }

    const assignments = await PlantAssignment.findAll({
      where: whereClause,
      include: [
        { model: Plant, as: 'plant', attributes: ['name', 'species', 'category'] },
        { model: Child, as: 'child', attributes: ['mother_name', 'child_name', 'mother_mobile'] },
        { model: User, as: 'assignedBy', attributes: ['name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      message: 'Plant assignments retrieved successfully',
      data: { assignments }
    });
  } catch (error) {
    console.error('Get plant assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getPlants = async (req, res) => {
  try {
    const plants = await Plant.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      message: 'Plants retrieved successfully',
      data: { plants }
    });
  } catch (error) {
    console.error('Get plants error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  assignPlants: [validateRequest(schemas.plantAssignment), assignPlants],
  getPlantAssignments,
  getPlants
};
