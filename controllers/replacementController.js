const { ReplacementRequest, PlantAssignment, Plant, Child, User } = require('../models');
const { validateRequest, schemas } = require('../middleware/validation');

const submitReplacementRequest = async (req, res) => {
  try {
    const { assignment_id, reason, description } = req.body;

    // Check if assignment exists
    const assignment = await PlantAssignment.findByPk(assignment_id, {
      include: [
        { model: Child, as: 'child' },
        { model: Plant, as: 'plant' }
      ]
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Plant assignment not found'
      });
    }

    // Check if user has permission to request replacement
    const userRole = req.user.role.name;
    if (userRole === 'mitanin' && assignment.child.assigned_mitanin_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only request replacement for your assigned children'
      });
    }

    // Check if there's already a pending request for this assignment
    const existingRequest = await ReplacementRequest.findOne({
      where: {
        assignment_id,
        status: 'pending'
      }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'There is already a pending replacement request for this plant'
      });
    }

    // Create replacement request
    const replacementRequest = await ReplacementRequest.create({
      assignment_id,
      reason,
      description,
      requested_by: req.user.id
    });

    // Fetch complete request data
    const completeRequest = await ReplacementRequest.findByPk(replacementRequest.id, {
      include: [
        {
          model: PlantAssignment,
          as: 'assignment',
          include: [
            { model: Plant, as: 'plant', attributes: ['name', 'species'] },
            { model: Child, as: 'child', attributes: ['mother_name', 'child_name'] }
          ]
        },
        { model: User, as: 'requestedBy', attributes: ['name'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Replacement request submitted successfully',
      data: { request: completeRequest }
    });
  } catch (error) {
    console.error('Submit replacement request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during request submission'
    });
  }
};

const getReplacementRequests = async (req, res) => {
  try {
    const { status, child_id } = req.query;

    let whereClause = {};
    let includeClause = [
      {
        model: PlantAssignment,
        as: 'assignment',
        include: [
          { model: Plant, as: 'plant', attributes: ['name', 'species'] },
          { model: Child, as: 'child', attributes: ['mother_name', 'child_name'] }
        ]
      },
      { model: User, as: 'requestedBy', attributes: ['name'] },
      { model: User, as: 'reviewedBy', attributes: ['name'] }
    ];

    if (status) {
      whereClause.status = status;
    }

    if (child_id) {
      includeClause[0].include[1].where = { id: child_id };
    }

    // Filter based on user role
    if (req.user.role.name === 'mitanin') {
      whereClause.requested_by = req.user.id;
    }

    const requests = await ReplacementRequest.findAll({
      where: whereClause,
      include: includeClause,
      order: [['request_date', 'DESC']]
    });

    res.json({
      success: true,
      message: 'Replacement requests retrieved successfully',
      data: { requests }
    });
  } catch (error) {
    console.error('Get replacement requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const reviewReplacementRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, review_notes } = req.body;

    // Check if user has permission to review
    const userRole = req.user.role.name;
    if (!['hospital', 'collector', 'state'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to review replacement requests'
      });
    }

    const request = await ReplacementRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Replacement request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request has already been reviewed'
      });
    }

    // Update request
    await request.update({
      status,
      review_notes,
      reviewed_by: req.user.id,
      review_date: new Date()
    });

    // If approved, mark original assignment as replaced
    if (status === 'approved') {
      await PlantAssignment.update(
        { status: 'replaced' },
        { where: { id: request.assignment_id } }
      );
    }

    // Fetch updated request data
    const updatedRequest = await ReplacementRequest.findByPk(id, {
      include: [
        {
          model: PlantAssignment,
          as: 'assignment',
          include: [
            { model: Plant, as: 'plant', attributes: ['name', 'species'] },
            { model: Child, as: 'child', attributes: ['mother_name', 'child_name'] }
          ]
        },
        { model: User, as: 'requestedBy', attributes: ['name'] },
        { model: User, as: 'reviewedBy', attributes: ['name'] }
      ]
    });

    res.json({
      success: true,
      message: 'Request reviewed successfully',
      data: { request: updatedRequest }
    });
  } catch (error) {
    console.error('Review replacement request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during request review'
    });
  }
};

module.exports = {
  submitReplacementRequest: [validateRequest(schemas.replacementRequest), submitReplacementRequest],
  getReplacementRequests,
  reviewReplacementRequest
};
