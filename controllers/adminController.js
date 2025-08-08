const { User, Child, Plant, PlantAssignment, PlantPhoto, PlantTrackingSchedule, District, Block, Village, ReplacementRequest, Role } = require('../models');
const { Op } = require('sequelize');
const { sequelize: dbInstance } = require('../config/database');
const { generateTrackingSchedule } = require('../utils/plantTrackingUtils');

class AdminController {
  // Dashboard
  async dashboard(req, res) {
    try {
      // Get statistics
      const stats = await AdminController.getStats();
      const districtStats = await AdminController.getDistrictStats();
      const dailyStats = await AdminController.getDailyStats();
      const recentActivities = await AdminController.getRecentActivities();
      const realTimeData = await AdminController.getDashboardRealTimeData();

      res.render('admin/dashboard', {
        title: 'डैशबोर्ड - ग्रीन पालना योजना',
        currentPage: 'dashboard',
        stats,
        districtStats,
        monthlyStats: dailyStats.dailyData,
        recentActivities,
        realTimeData,
        user: req.user || null,
        getTimeAgo: function(date) {
          const now = new Date();
          const then = new Date(date);
          const diffMs = now - then;
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);

          if (diffMins < 1) return 'अभी अभी';
          if (diffMins < 60) return `${diffMins} मिनट पहले`;
          if (diffHours < 24) return `${diffHours} घंटे पहले`;
          if (diffDays < 7) return `${diffDays} दिन पहले`;
          return then.toLocaleDateString('hi-IN');
        }
      });
    } catch (error) {
      res.status(500).render('error', { 
        title: 'त्रुटि',
        currentPage: 'error',
        message: 'डैशबोर्ड लोड करने में त्रुटि हुई' 
      });
    }
  }

  // Users Management (District Level Only - excludes state admin)
  async users(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';
      const status = req.query.status || '';

      // Build where conditions for district users only (role_id 2)
      let whereConditions = {
        role_id: 2 // Only district/collector users
      };

      // Add search conditions
      if (search) {
        whereConditions[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { mobile: { [Op.like]: `%${search}%` } }
        ];
      }

      // Add status filter
      if (status) {
        whereConditions.is_active = status === 'active';
      }

      const { count, rows: users } = await User.findAndCountAll({
        where: whereConditions,
        limit,
        offset,
        order: [['created_at', 'DESC']],
        include: [
          { 
            model: Role, 
            as: 'role'
          }
        ]
      });

      const totalPages = Math.ceil(count / limit);

      res.render('admin/users', {
        title: 'जिला स्तरीय उपयोगकर्ता प्रबंधन',
        currentPage: 'users',
        users,
        page: page,
        totalPages,
        totalUsers: count,
        user: req.user,
        req: req,
        filterType: 'district'
      });
    } catch (error) {
      console.error('Users Error:', error);
      res.status(500).render('error', { 
        title: 'त्रुटि',
        currentPage: 'error',
        message: 'उपयोगकर्ता सूची लोड करने में त्रुटि हुई' 
      });
    }
  }

  // Hospital Users Management (excludes state admin)
  async hospitalUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';
      const status = req.query.status || '';

      // Build where conditions
      let whereConditions = {};

      // Add search conditions
      if (search) {
        whereConditions[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { mobile: { [Op.like]: `%${search}%` } }
        ];
      }

      // Add status filter
      if (status) {
        whereConditions.is_active = status === 'active';
      }

      const { count, rows: users } = await User.findAndCountAll({
        where: whereConditions,
        limit,
        offset,
        order: [['created_at', 'DESC']],
        include: [
          { 
            model: Role, 
            as: 'role',
            where: { name: 'hospital' }
          }
        ]
      });

      const totalPages = Math.ceil(count / limit);

      res.render('admin/users', {
        title: 'अस्पताल उपयोगकर्ता प्रबंधन',
        currentPage: 'hospitals',
        users,
        page: page,
        totalPages,
        totalUsers: count,
        user: req.user,
        req: req,
        filterType: 'hospital'
      });
    } catch (error) {
      console.error('Hospital Users Error:', error);
      res.status(500).render('error', { 
        title: 'त्रुटि',
        currentPage: 'error',
        message: 'अस्पताल उपयोगकर्ता सूची लोड करने में त्रुटि हुई' 
      });
    }
  }

  // Mitanin Users Management (excludes state admin)
  async mitaninUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';
      const status = req.query.status || '';

      // Build where conditions
      let whereConditions = {};

      // Add search conditions
      if (search) {
        whereConditions[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { mobile: { [Op.like]: `%${search}%` } }
        ];
      }

      // Add status filter
      if (status) {
        whereConditions.is_active = status === 'active';
      }

      const { count, rows: users } = await User.findAndCountAll({
        where: whereConditions,
        limit,
        offset,
        order: [['created_at', 'DESC']],
        include: [
          { 
            model: Role, 
            as: 'role',
            where: { name: 'mitanin' }
          }
        ]
      });

      const totalPages = Math.ceil(count / limit);

      res.render('admin/users', {
        title: 'मितानिन उपयोगकर्ता प्रबंधन',
        currentPage: 'mitanins',
        users,
        page: page,
        totalPages,
        totalUsers: count,
        user: req.user,
        req: req,
        filterType: 'mitanin'
      });
    } catch (error) {
      console.error('Mitanin Users Error:', error);
      res.status(500).render('error', { 
        title: 'त्रुटि',
        currentPage: 'error',
        message: 'मितानिन उपयोगकर्ता सूची लोड करने में त्रुटि हुई' 
      });
    }
  }

  // Mothers Management
  async mothers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';
      const block = req.query.block || '';
      const hospital = req.query.hospital || '';

      // Get blocks for the district 387 for filter dropdown
      const blocks = await Block.findAll({
        where: { lgd_district_code: 387 },
        order: [['block_name', 'ASC']]
      });

      // Get hospitals for the dropdown (initially all hospitals in district 387)
      let hospitals = [];
      if (block) {
        // If block is selected, get hospitals in that block only
        hospitals = await User.findAll({
          where: {
            block_id: block,
            is_active: true
          },
          include: [
            { 
              model: Role, 
              as: 'role',
              where: { name: 'hospital' }
            }
          ],
          attributes: ['id', 'name', 'hospital_name', 'mobile'],
          order: [['hospital_name', 'ASC'], ['name', 'ASC']]
        });
      } else {
        // Get all hospitals in district 387
        hospitals = await User.findAll({
          where: {
            is_active: true
          },
          include: [
            { 
              model: Role, 
              as: 'role',
              where: { name: 'hospital' }
            }
          ],
          attributes: ['id', 'name', 'hospital_name', 'mobile'],
          order: [['hospital_name', 'ASC'], ['name', 'ASC']]
        });
      }

      // Build where conditions for search
      let searchCondition = '';
      if (search.trim()) {
        searchCondition = `AND (c.mother_name LIKE '%${search}%' OR c.mother_mobile LIKE '%${search}%')`;
      }

      // Build block filter condition
      let blockCondition = '';
      if (block) {
        blockCondition = `AND c.block_code = '${block}'`;
      } else {
        blockCondition = `AND b.lgd_district_code = 387`;
      }

      // Build hospital filter condition
      let hospitalCondition = '';
      if (hospital) {
        hospitalCondition = `AND c.hospital_id = '${hospital}'`;
      }

      // Raw SQL query to get unique mothers with child counts and last child entry date
      const mothersQuery = `
        SELECT 
          c.mother_name,
          c.mother_mobile,
          c.hospital_id,
          c.assigned_mitanin_id as mitanin_id,
          c.district_code,
          c.block_code,
          c.village_code,
          c.is_active,
          COUNT(*) as child_count,
          MAX(c.created_at) as last_child_entry_date,
          MIN(c.created_at) as first_child_entry_date,
          h.name as hospital_name,
          m.name as mitanin_name,
          d.district_name,
          b.block_name,
          v.village_name,
          (SELECT c2.child_order FROM tbl_child c2 WHERE c2.mother_name = c.mother_name AND c2.mother_mobile = c.mother_mobile ORDER BY c2.created_at DESC LIMIT 1) as last_child_order,
          (SELECT c2.gender FROM tbl_child c2 WHERE c2.mother_name = c.mother_name AND c2.mother_mobile = c.mother_mobile ORDER BY c2.created_at DESC LIMIT 1) as last_child_gender
        FROM tbl_child c
        LEFT JOIN tbl_user h ON c.hospital_id = h.id
        LEFT JOIN tbl_user m ON c.assigned_mitanin_id = m.id  
        LEFT JOIN master_district d ON c.district_code = d.district_code
        LEFT JOIN master_block b ON c.block_code = b.block_code
        LEFT JOIN master_village v ON c.village_code = v.village_code
        WHERE 1=1 ${searchCondition} ${blockCondition} ${hospitalCondition}
        GROUP BY c.mother_name, c.mother_mobile, c.hospital_id, c.assigned_mitanin_id, 
                 c.district_code, c.block_code, c.village_code, c.is_active,
                 h.name, m.name, d.district_name, b.block_name, v.village_name
        ORDER BY last_child_entry_date DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      // Count query for pagination
      const countQuery = `
        SELECT COUNT(DISTINCT CONCAT(c.mother_name, '_', COALESCE(c.mother_mobile, ''))) as total
        FROM tbl_child c
        LEFT JOIN master_block b ON c.block_code = b.block_code
        WHERE 1=1 ${searchCondition} ${blockCondition} ${hospitalCondition}
      `;

      const [mothersResult] = await dbInstance.query(mothersQuery);
      const [countResult] = await dbInstance.query(countQuery);
      
      // Get overall stats (not paginated)
      const statsQuery = `
        SELECT 
          COUNT(DISTINCT CONCAT(c.mother_name, '_', COALESCE(c.mother_mobile, ''))) as total_mothers,
          SUM(CASE WHEN c.is_active = 1 THEN 1 ELSE 0 END) as active_mothers,
          SUM(CASE WHEN c.is_active = 0 THEN 1 ELSE 0 END) as inactive_mothers,
          SUM(CASE WHEN MONTH(c.created_at) = MONTH(CURRENT_DATE()) AND YEAR(c.created_at) = YEAR(CURRENT_DATE()) THEN 1 ELSE 0 END) as new_this_month
        FROM (
          SELECT 
            c.mother_name,
            c.mother_mobile,
            MAX(c.is_active) as is_active,
            MIN(c.created_at) as created_at
          FROM tbl_child c
          LEFT JOIN master_block b ON c.block_code = b.block_code
          WHERE 1=1 ${searchCondition} ${blockCondition} ${hospitalCondition}
          GROUP BY c.mother_name, c.mother_mobile
        ) c
      `;
      
      const [statsResult] = await dbInstance.query(statsQuery);
      const overallStats = statsResult[0] || {
        total_mothers: 0,
        active_mothers: 0, 
        inactive_mothers: 0,
        new_this_month: 0
      };
      
      const mothers = mothersResult;
      const totalMothers = countResult[0]?.total || 0;
      const totalPages = Math.ceil(totalMothers / limit);

      res.render('admin/mothers', {
        title: 'माता प्रबंधन',
        currentPage: 'mothers',
        mothers,
        blocks,
        hospitals,
        page: page,
        totalPages,
        totalMothers: totalMothers,
        overallStats: overallStats,
        user: req.user,
        req: req,
        isBlockViewer: req.user?.role?.name === 'block_viewer'
      });
    } catch (error) {
      console.error('Mothers Error:', error);
      res.status(500).render('error', { 
        title: 'त्रुटि',
        currentPage: 'error',
        message: 'माता सूची लोड करने में त्रुटि हुई' 
      });
    }
  }

  // Export Mothers Data to Excel
  async exportMothers(req, res) {
    try {
      const search = req.query.search || '';
      const block = req.query.block || '';
      const hospital = req.query.hospital || '';

      // Build where conditions for search (same as mothers method)
      let searchCondition = '';
      if (search.trim()) {
        searchCondition = `AND (c.mother_name LIKE '%${search}%' OR c.mother_mobile LIKE '%${search}%')`;
      }

      // Build block filter condition
      let blockCondition = '';
      if (block) {
        blockCondition = `AND c.block_code = '${block}'`;
      } else {
        blockCondition = `AND b.lgd_district_code = 387`;
      }

      // Build hospital filter condition
      let hospitalCondition = '';
      if (hospital) {
        hospitalCondition = `AND c.hospital_id = '${hospital}'`;
      }

      // Raw SQL query to get all mothers data for export (no pagination)
      const mothersQuery = `
        SELECT 
          c.mother_name as 'माता का नाम',
          c.mother_mobile as 'मोबाइल नंबर',
          COUNT(*) as 'बच्चों की संख्या',
          MAX(c.created_at) as 'अंतिम बच्चे की प्रविष्टि',
          MIN(c.created_at) as 'पहली बच्चे की प्रविष्टि',
          h.hospital_name as 'अस्पताल का नाम',
          m.name as 'मितानिन का नाम',
          d.district_name as 'जिला',
          b.block_name as 'ब्लॉक',
          v.village_name as 'गांव',
          (SELECT c2.child_order FROM tbl_child c2 WHERE c2.mother_name = c.mother_name AND c2.mother_mobile = c.mother_mobile ORDER BY c2.created_at DESC LIMIT 1) as 'अंतिम बच्चे का क्रम',
          (SELECT CASE WHEN c2.gender = 'male' THEN 'पुत्र' ELSE 'पुत्री' END FROM tbl_child c2 WHERE c2.mother_name = c.mother_name AND c2.mother_mobile = c.mother_mobile ORDER BY c2.created_at DESC LIMIT 1) as 'अंतिम बच्चे का लिंग',
          CASE WHEN c.is_active = 1 THEN 'सक्रिय' ELSE 'निष्क्रिय' END as 'स्थिति'
        FROM tbl_child c
        LEFT JOIN tbl_user h ON c.hospital_id = h.id
        LEFT JOIN tbl_user m ON c.assigned_mitanin_id = m.id  
        LEFT JOIN master_district d ON c.district_code = d.district_code
        LEFT JOIN master_block b ON c.block_code = b.block_code
        LEFT JOIN master_village v ON c.village_code = v.village_code
        WHERE 1=1 ${searchCondition} ${blockCondition} ${hospitalCondition}
        GROUP BY c.mother_name, c.mother_mobile, c.hospital_id, c.assigned_mitanin_id, 
                 c.district_code, c.block_code, c.village_code, c.is_active,
                 h.hospital_name, m.name, d.district_name, b.block_name, v.village_name
        ORDER BY MAX(c.created_at) DESC
      `;

      const [mothersResult] = await dbInstance.query(mothersQuery);

      // Create Excel workbook
      const XLSX = require('xlsx');
      const workbook = XLSX.utils.book_new();
      
      // Convert data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(mothersResult);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'माताओं की सूची');

      // Generate filename with current date
      const now = new Date();
      const filename = `Mothers_Data_${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')}.xlsx`;

      // Set response headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Write workbook to response
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.send(buffer);

    } catch (error) {
      console.error('Export Mothers Error:', error);
      res.status(500).json({
        success: false,
        message: 'डेटा एक्सपोर्ट करने में त्रुटि हुई'
      });
    }
  }

  // Export Children Data to Excel
  async exportChildren(req, res) {
    try {
      const search = req.query.search || '';
      const block = req.query.block || '';
      const gender = req.query.gender || '';
      const status = req.query.status || '';
      const mother = req.query.mother || '';
      const mobile = req.query.mobile || '';

      // Build where conditions for search (same as children method)
      let searchCondition = '';
      if (search.trim()) {
        searchCondition = `AND (c.child_name LIKE '%${search}%' OR c.mother_name LIKE '%${search}%')`;
      }

      // Build mother filter condition
      let motherCondition = '';
      if (mother) {
        motherCondition = `AND c.mother_name = '${mother}'`;
        if (mobile) {
          motherCondition += ` AND c.mother_mobile = '${mobile}'`;
        }
      }

      // Build gender filter condition
      let genderCondition = '';
      if (gender) {
        genderCondition = `AND c.gender = '${gender}'`;
      }

      // Build status filter condition
      let statusCondition = '';
      if (status === 'active') {
        statusCondition = `AND c.is_active = 1`;
      } else if (status === 'inactive') {
        statusCondition = `AND c.is_active = 0`;
      }

      // Build block filter condition
      let blockCondition = '';
      if (block) {
        blockCondition = `AND c.block_code = '${block}'`;
      } else {
        blockCondition = `AND b.lgd_district_code = 387`;
      }

      // Raw SQL query to get all children data for export (no pagination)
      const childrenQuery = `
        SELECT 
          c.id as 'ID',
          h.hospital_name as 'अस्पताल का नाम',
          c.mother_name as 'माता का नाम',
          c.mother_mobile as 'माता का मोबाइल',
          c.child_name as 'बच्चे का नाम',
          CASE WHEN c.gender = 'male' THEN 'पुत्र' ELSE 'पुत्री' END as 'लिंग',
          DATE_FORMAT(c.dob, '%d/%m/%Y') as 'जन्म तिथि',
          CASE 
            WHEN c.child_order = 'first' THEN 'पहला बच्चा'
            WHEN c.child_order = 'second' THEN 'दूसरा बच्चा'
            WHEN c.child_order = 'third' THEN 'तीसरा बच्चा'
            WHEN c.child_order = 'fourth' THEN 'चौथा बच्चा'
            ELSE 'अनुपलब्ध'
          END as 'बच्चे का क्रम',
          d.district_name as 'जिला',
          b.block_name as 'ब्लॉक',
          v.village_name as 'गांव',
          CASE 
            WHEN c.delivery_type = 'normal' THEN 'सामान्य प्रसव'
            WHEN c.delivery_type = 'cesarean' THEN 'सिजेरियन'
            WHEN c.delivery_type = 'assisted' THEN 'सहायक प्रसव'
            ELSE 'अनुपलब्ध'
          END as 'प्रसव प्रकार',
          m.name as 'मितानिन का नाम',
          CASE WHEN c.is_active = 1 THEN 'सक्रिय' ELSE 'निष्क्रिय' END as 'स्थिति',
          DATE_FORMAT(c.created_at, '%d/%m/%Y %H:%i') as 'प्रविष्टि तिथि'
        FROM tbl_child c
        LEFT JOIN tbl_user h ON c.hospital_id = h.id
        LEFT JOIN tbl_user m ON c.assigned_mitanin_id = m.id  
        LEFT JOIN master_district d ON c.district_code = d.district_code
        LEFT JOIN master_block b ON c.block_code = b.block_code
        LEFT JOIN master_village v ON c.village_code = v.village_code
        WHERE 1=1 ${searchCondition} ${motherCondition} ${genderCondition} ${statusCondition} ${blockCondition}
        ORDER BY c.created_at DESC
      `;

      const [childrenResult] = await dbInstance.query(childrenQuery);

      // Create Excel workbook
      const XLSX = require('xlsx');
      const workbook = XLSX.utils.book_new();
      
      // Convert data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(childrenResult);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'बच्चों की सूची');

      // Generate filename with current date
      const now = new Date();
      const filename = `Children_Data_${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')}.xlsx`;

      // Set response headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Write workbook to response
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.send(buffer);

    } catch (error) {
      console.error('Export Children Error:', error);
      res.status(500).json({
        success: false,
        message: 'डेटा एक्सपोर्ट करने में त्रुटि हुई'
      });
    }
  }

  // Export Users Data to Excel
  async exportUsers(req, res) {
    try {
      const search = req.query.search || '';
      const status = req.query.status || '';
      const type = req.query.type || 'district'; // district, hospital, mitanin

      // Build where conditions for search
      let searchCondition = '';
      if (search.trim()) {
        searchCondition = `AND (u.name LIKE '%${search}%' OR u.mobile LIKE '%${search}%')`;
      }

      // Build status filter condition
      let statusCondition = '';
      if (status === 'active') {
        statusCondition = `AND u.is_active = 1`;
      } else if (status === 'inactive') {
        statusCondition = `AND u.is_active = 0`;
      }

      // Build role filter condition based on type
      let roleCondition = '';
      if (type === 'district') {
        roleCondition = `AND r.name = 'collector'`;
      } else if (type === 'hospital') {
        roleCondition = `AND r.name = 'hospital'`;
      } else if (type === 'mitanin') {
        roleCondition = `AND r.name = 'mitanin'`;
      }

      // Raw SQL query to get all users data for export (no pagination)
      const usersQuery = `
        SELECT 
          u.id as 'ID',
          u.name as 'नाम',
          u.mobile as 'फोन नंबर',
          u.email as 'ईमेल',
          u.hospital_name as 'अस्पताल का नाम',
          u.userid as 'यूजर ID',
          r.name as 'भूमिका',
          CASE WHEN u.is_active = 1 THEN 'सक्रिय' ELSE 'निष्क्रिय' END as 'स्थिति',
          CASE WHEN u.is_password_changed = 1 THEN 'हाँ' ELSE 'नहीं' END as 'पासवर्ड बदला गया',
          DATE_FORMAT(u.created_at, '%d/%m/%Y %H:%i') as 'पंजीकरण तिथि',
          DATE_FORMAT(u.updated_at, '%d/%m/%Y %H:%i') as 'अंतिम अपडेट',
          DATE_FORMAT(u.last_login, '%d/%m/%Y %H:%i') as 'अंतिम लॉगिन'
        FROM tbl_user u
        LEFT JOIN tbl_role r ON u.role_id = r.id
        WHERE 1=1 ${searchCondition} ${statusCondition} ${roleCondition}
        ORDER BY u.created_at DESC
      `;

      const [usersResult] = await dbInstance.query(usersQuery);

      // Create Excel workbook
      const XLSX = require('xlsx');
      const workbook = XLSX.utils.book_new();
      
      // Convert data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(usersResult);
      
      // Add worksheet to workbook
      const sheetName = type === 'district' ? 'जिला स्तरीय उपयोगकर्ता' : 
                       type === 'hospital' ? 'अस्पताल उपयोगकर्ता' : 
                       type === 'mitanin' ? 'मितानिन उपयोगकर्ता' : 'उपयोगकर्ता';
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Generate filename with current date
      const now = new Date();
      const filename = `Users_${type}_Data_${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')}.xlsx`;

      // Set response headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Write workbook to response
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.send(buffer);

    } catch (error) {
      console.error('Export Users Error:', error);
      res.status(500).json({
        success: false,
        message: 'डेटा एक्सपोर्ट करने में त्रुटि हुई'
      });
    }
  }

  // Mother Edit Management
  async editMotherForm(req, res) {
    try {
      const mobile = req.params.mobile;

      // Find mother user by mobile number with role 'mother'
      const motherUser = await User.findOne({
        where: { mobile: mobile },
        include: [
          { 
            model: Role, 
            as: 'role',
            where: { name: 'mother' }
          }
        ]
      });

      if (!motherUser) {
        return res.status(404).render('error', {
          title: 'त्रुटि',
          currentPage: 'error',
          message: 'माता की जानकारी नहीं मिली'
        });
      }

      // Get districts for dropdown (only Raipur - LGD code 387)
      const districts = await District.findAll({
        where: { lgd_district_code: 387 }, // Only Raipur district
        order: [['district_name', 'ASC']]
      });

      // Get blocks for district 387 only
      const blocks = await Block.findAll({
        where: { lgd_district_code: 387 }, // Only blocks under Raipur
        order: [['block_name', 'ASC']]
      });

      // Get hospitals
      const hospitals = await User.findAll({
        include: [
          { 
            model: Role, 
            as: 'role',
            where: { name: 'hospital' }
          }
        ],
        order: [['name', 'ASC']]
      });

      res.render('admin/mother-edit', {
        title: 'माता संपादन',
        currentPage: 'mothers',
        mother: motherUser,
        districts,
        blocks,
        hospitals,
        user: req.user
      });
    } catch (error) {
      console.error('Edit Mother Form Error:', error);
      res.status(500).render('error', {
        title: 'त्रुटि',
        currentPage: 'error',
        message: 'माता संपादन फॉर्म लोड करने में त्रुटि हुई'
      });
    }
  }

  async updateMother(req, res) {
    try {
      const mobile = req.params.mobile;
      const { name, email, new_mobile, block_id, hospital_id } = req.body;
      
      // Force district to be 387 (Raipur lgd_district_code) - no other district allowed
      const district_id = 387;

      // Find mother user
      const motherUser = await User.findOne({
        where: { mobile: mobile },
        include: [
          { 
            model: Role, 
            as: 'role',
            where: { name: 'mother' }
          }
        ]
      });

      if (!motherUser) {
        return res.status(404).json({
          success: false,
          message: 'माता की जानकारी नहीं मिली'
        });
      }

      // Start transaction to update both User and Child tables
      const transaction = await dbInstance.transaction();
      
      try {
        // Update User table
        await User.update({
          name: name,
          mobile: new_mobile,
          email: email,
          district_id: district_id, // Always 387
          block_id: block_id,
          hospital_id: hospital_id
        }, {
          where: { id: motherUser.id },
          transaction
        });

        // Update all Child records with this mother's information
        // Note: Child table uses district_code (3316) not lgd_district_code (387)
        await Child.update({
          mother_name: name,
          mother_mobile: new_mobile,
          hospital_id: hospital_id,
          district_code: 3316, // Raipur district_code for Child table
          block_code: block_id
        }, {
          where: { mother_mobile: mobile },
          transaction
        });

        await transaction.commit();

        req.flash('success', 'माता की जानकारी सफलतापूर्वक अपडेट की गई');
        res.redirect('/admin/mothers');
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Update Mother Error:', error);
      req.flash('error', 'माता की जानकारी अपडेट करने में त्रुटि हुई');
      res.redirect(`/admin/mothers/${req.params.mobile}/edit`);
    }
  }

  // Children Management
  async children(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';
      const block = req.query.block || '';
      const gender = req.query.gender || '';
      const mother = req.query.mother || '';
      const mobile = req.query.mobile || '';

      // Build where conditions
      const whereConditions = {};

      // Add search condition if provided
      if (search.trim()) {
        const { Op } = require('sequelize');
        whereConditions[Op.or] = [
          { child_name: { [Op.like]: `%${search}%` } },
          { mother_name: { [Op.like]: `%${search}%` } }
        ];
      }

      // Add mother filter if coming from mothers page
      if (mother) {
        whereConditions.mother_name = mother;
        if (mobile) {
          whereConditions.mother_mobile = mobile;
        }
      }

      // Add gender filter if specified
      if (gender) {
        whereConditions.gender = gender;
      }

      // Get blocks for the district 387 for filter dropdown
      const blocks = await Block.findAll({
        where: { lgd_district_code: 387 },
        order: [['block_name', 'ASC']]
      });

      // Build include conditions
      const includeOptions = [
        { 
          model: User, 
          as: 'hospital',
          attributes: ['id', 'name', 'hospital_name', 'mobile']
        },
        { 
          model: User, 
          as: 'mitanin',
          attributes: ['id', 'name', 'mobile']
        },
        { model: District, as: 'district' },
        { model: Village, as: 'village' }
      ];

      // Add block filter if specified or default to district 387
      if (block) {
        includeOptions.push({
          model: Block, 
          as: 'block',
          where: { block_code: block, lgd_district_code: 387 },
          required: true
        });
      } else {
        includeOptions.push({
          model: Block, 
          as: 'block',
          where: { lgd_district_code: 387 },
          required: true
        });
      }

      const { count, rows: children } = await Child.findAndCountAll({
        where: whereConditions,
        limit,
        offset,
        order: [['created_at', 'DESC']],
        include: includeOptions
      });

      // Calculate overall statistics (considering filters but without pagination)
      const overallStats = {};
      
      // Build base where condition for stats (without pagination but with filters)
      const statsWhereConditions = {};
      
      // Add search condition if provided
      if (search.trim()) {
        const { Op } = require('sequelize');
        statsWhereConditions[Op.or] = [
          { child_name: { [Op.like]: `%${search}%` } },
          { mother_name: { [Op.like]: `%${search}%` } }
        ];
      }

      // Add mother filter if coming from mothers page
      if (mother) {
        statsWhereConditions.mother_name = mother;
        if (mobile) {
          statsWhereConditions.mother_mobile = mobile;
        }
      }

      // Build include options for stats
      const statsIncludeOptions = [
        { 
          model: User, 
          as: 'hospital',
          attributes: ['id']
        }
      ];

      // Add block filter if specified or default to district 387
      if (block) {
        statsIncludeOptions.push({
          model: Block, 
          as: 'block',
          where: { block_code: block, lgd_district_code: 387 },
          required: true
        });
      } else {
        statsIncludeOptions.push({
          model: Block, 
          as: 'block',
          where: { lgd_district_code: 387 },
          required: true
        });
      }
      
      // Total children count (with filters)
      const totalChildrenCount = await Child.count({
        where: statsWhereConditions,
        include: statsIncludeOptions
      });
      
      // Male children count (with filters)
      const maleStatsWhere = { ...statsWhereConditions, gender: 'male' };
      const maleChildrenCount = await Child.count({
        where: maleStatsWhere,
        include: statsIncludeOptions
      });
      
      // Female children count (with filters)
      const femaleStatsWhere = { ...statsWhereConditions, gender: 'female' };
      const femaleChildrenCount = await Child.count({
        where: femaleStatsWhere,
        include: statsIncludeOptions
      });
      
      // This month new children (with filters)
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const newThisMonthWhere = { 
        ...statsWhereConditions, 
        created_at: {
          [require('sequelize').Op.gte]: startOfMonth
        }
      };
      const newThisMonthCount = await Child.count({
        where: newThisMonthWhere,
        include: statsIncludeOptions
      });
      
      overallStats.total_children = totalChildrenCount;
      overallStats.male_children = maleChildrenCount;
      overallStats.female_children = femaleChildrenCount;
      overallStats.new_this_month = newThisMonthCount;

      const totalPages = Math.ceil(count / limit);

      // Determine page title based on filter
      let pageTitle = 'बच्चे प्रबंधन';
      if (mother) {
        pageTitle = `${mother} के बच्चे`;
      }

      res.render('admin/children', {
        title: pageTitle,
        currentPage: 'children',
        children,
        blocks,
        page: page,
        totalPages,
        totalChildren: count,
        overallStats,
        user: req.user,
        req: req,
        filterMother: mother
      });
    } catch (error) {
      console.error('Children Error:', error);
      res.status(500).render('error', { 
        title: 'त्रुटि',
        currentPage: 'error',
        message: 'बच्चे सूची लोड करने में त्रुटि हुई' 
      });
    }
  }

  // Child view method
  async viewChild(req, res) {
    try {
      const childId = req.params.id;

      const child = await Child.findByPk(childId, {
        include: [
          { 
            model: User, 
            as: 'hospital',
            attributes: ['id', 'name', 'hospital_name', 'mobile']
          },
          { 
            model: User, 
            as: 'mitanin',
            attributes: ['id', 'name', 'mobile']
          },
          { model: District, as: 'district' },
          { model: Block, as: 'block' },
          { model: Village, as: 'village' }
        ]
      });

      if (!child) {
        return res.status(404).render('error', {
          title: 'त्रुटि',
          currentPage: 'error',
          message: 'बच्चे की जानकारी नहीं मिली'
        });
      }

      // Fetch plant details if plant_quantity exists
      let plantsWithDetails = [];
      if (child.plant_quantity && Array.isArray(child.plant_quantity)) {
        const plantIds = child.plant_quantity.map(p => p.plant_id);
        const plants = await Plant.findAll({
          where: { id: plantIds }
        });
        
        // Create a map of plant ID to plant details
        const plantMap = {};
        plants.forEach(plant => {
          plantMap[plant.id] = plant;
        });
        
        // Combine plant quantity data with plant details
        plantsWithDetails = child.plant_quantity.map(plantData => ({
          ...plantData,
          plant: plantMap[plantData.plant_id]
        }));
      }

      res.render('admin/child-view', {
        title: 'बच्चे का विवरण',
        currentPage: 'children',
        child,
        plantsWithDetails,
        user: req.user
      });
    } catch (error) {
      console.error('View Child Error:', error);
      res.status(500).render('error', {
        title: 'त्रुटि',
        currentPage: 'error',
        message: 'बच्चे का विवरण लोड करने में त्रुटि हुई'
      });
    }
  }

  // Child edit form method
  async editChildForm(req, res) {
    try {
      const childId = req.params.id;

      const child = await Child.findByPk(childId, {
        include: [
          { model: User, as: 'hospital' },
          { model: User, as: 'mitanin' },
          { model: District, as: 'district' },
          { model: Block, as: 'block' },
          { model: Village, as: 'village' }
        ]
      });

      if (!child) {
        return res.status(404).render('error', {
          title: 'त्रुटि',
          currentPage: 'error',
          message: 'बच्चे की जानकारी नहीं मिली'
        });
      }

      // Get required data for dropdowns
      const districts = await District.findAll({
        where: { lgd_district_code: 387 },
        order: [['district_name', 'ASC']]
      });

      const blocks = await Block.findAll({
        where: { lgd_district_code: 387 },
        order: [['block_name', 'ASC']]
      });

      const hospitals = await User.findAll({
        include: [
          { 
            model: Role, 
            as: 'role',
            where: { name: 'hospital' }
          }
        ],
        order: [['name', 'ASC']]
      });

      res.render('admin/child-edit', {
        title: 'बच्चे की जानकारी संपादित करें',
        currentPage: 'children',
        child,
        districts,
        blocks,
        hospitals,
        user: req.user
      });
    } catch (error) {
      console.error('Edit Child Form Error:', error);
      res.status(500).render('error', {
        title: 'त्रुटि',
        currentPage: 'error',
        message: 'बच्चे संपादन फॉर्म लोड करने में त्रुटि हुई'
      });
    }
  }

  // Child update method
  async updateChild(req, res) {
    try {
      const childId = req.params.id;
      const { 
        child_name, 
        mother_name, 
        mother_mobile, 
        gender, 
        dob, 
        delivery_type, 
        child_order, 
        block_code, 
        hospital_id,
        is_active 
      } = req.body;

      const child = await Child.findByPk(childId);

      if (!child) {
        req.flash('error', 'बच्चे की जानकारी नहीं मिली');
        return res.redirect('/admin/children');
      }

      await Child.update({
        child_name: child_name,
        mother_name: mother_name,
        mother_mobile: mother_mobile,
        gender: gender,
        dob: dob,
        delivery_type: delivery_type,
        child_order: child_order,
        block_code: block_code,
        hospital_id: hospital_id,
        district_code: 3316, // Always Raipur
        is_active: is_active === 'on'
      }, {
        where: { id: childId }
      });

      req.flash('success', 'बच्चे की जानकारी सफलतापूर्वक अपडेट की गई');
      res.redirect('/admin/children');
    } catch (error) {
      console.error('Update Child Error:', error);
      req.flash('error', 'बच्चे की जानकारी अपडेट करने में त्रुटि हुई');
      res.redirect(`/admin/children/${req.params.id}/edit`);
    }
  }

  // API endpoint to get blocks by district
  async getBlocksByDistrict(req, res) {
    try {
      const districtId = req.query.district_id;
      
      if (!districtId) {
        return res.json({ blocks: [] });
      }

      const blocks = await Block.findAll({
        where: { lgd_district_code: districtId },
        order: [['block_name', 'ASC']]
      });

      res.json({ blocks });
    } catch (error) {
      console.error('Get Blocks Error:', error);
      res.status(500).json({ error: 'Failed to load blocks' });
    }
  }

  // API endpoint to get hospitals by block
  async getHospitalsByBlock(req, res) {
    try {
      const blockCode = req.query.block_code;
      console.log('Hospital API called with block_code:', blockCode);
      
      if (!blockCode) {
        // Return all hospitals if no block selected
        const hospitalsQuery = `
          SELECT DISTINCT 
            h.id, 
            h.name, 
            h.hospital_name, 
            h.mobile
          FROM tbl_user h
          INNER JOIN master_role r ON h.role_id = r.id
          WHERE r.name = 'hospital' 
            AND h.is_active = 1
          ORDER BY h.hospital_name ASC, h.name ASC
        `;

        const [hospitals] = await dbInstance.query(hospitalsQuery);
        console.log('All hospitals count:', hospitals.length);
        return res.json({ hospitals });
      }

      // Find hospitals by block_id (direct assignment to block)
      const hospitalsQuery = `
        SELECT DISTINCT 
          h.id, 
          h.name, 
          h.hospital_name, 
          h.mobile,
          h.block_id
        FROM tbl_user h
        INNER JOIN master_role r ON h.role_id = r.id
        WHERE r.name = 'hospital' 
          AND h.is_active = 1
          AND h.block_id = '${blockCode}'
        ORDER BY h.hospital_name ASC, h.name ASC
      `;

      const [hospitals] = await dbInstance.query(hospitalsQuery);

      res.json({ hospitals });
    } catch (error) {
      res.status(500).json({ error: 'Failed to load hospitals' });
    }
  }

  // Plants Management
  async plants(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows: plants } = await Plant.findAndCountAll({
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      // Get assignment counts for each plant
      const plantsWithCounts = await Promise.all(
        plants.map(async (plant) => {
          const distributedCount = await PlantAssignment.count({
            where: { plant_id: plant.id }
          });
          
          return {
            ...plant.toJSON(),
            distributed_count: distributedCount
          };
        })
      );

      const totalPages = Math.ceil(count / limit);

      res.render('admin/plants', {
        title: 'पौधा प्रबंधन',
        currentPage: 'plants',
        plants: plantsWithCounts,
        page: page,
        totalPages,
        totalPlants: count,
        user: req.user,
        req: req
      });
    } catch (error) {
      console.error('Plants Error:', error);
      res.status(500).render('error', { 
        title: 'त्रुटि',
        currentPage: 'error',
        message: 'पौधा सूची लोड करने में त्रुटि हुई' 
      });
    }
  }

  // Plant Assignments
  async assignments(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows: assignmentsList } = await PlantAssignment.findAndCountAll({
        limit,
        offset,
        order: [['created_at', 'DESC']],
        include: [
          { 
            model: Child, 
            as: 'child',
            include: [
              { model: User, as: 'hospital' }
            ]
          },
          { model: Plant, as: 'plant' },
          { model: User, as: 'assignedBy' }
        ]
      });

      // Group assignments by child (mother) and use JSON plant data
      const groupedAssignments = {};
      assignmentsList.forEach(assignment => {
        if (assignment.child && assignment.child.mother_name) {
          const motherName = assignment.child.mother_name;
          const childId = assignment.child.id;
          
          if (!groupedAssignments[childId]) {
            groupedAssignments[childId] = {
              mother_name: motherName,
              child: assignment.child,
              hospital_name: assignment.child.hospital ? assignment.child.hospital.name : 'N/A',
              plants: [],
              total_quantity: 0,
              assignments: []
            };

            // Parse plant_quantity JSON to get actual plants
            if (assignment.child.plant_quantity) {
              let plantQuantities = assignment.child.plant_quantity;
              
              // If it's a string, try to parse it as JSON
              if (typeof plantQuantities === 'string') {
                try {
                  plantQuantities = JSON.parse(plantQuantities);
                } catch (e) {
                  plantQuantities = null;
                }
              }
              
              // If it's an array (already parsed by Sequelize)
              if (Array.isArray(plantQuantities)) {
                // Get all plants from the assignments to map plant_id to plant name
                const plantMap = {};
                assignmentsList.forEach(a => {
                  if (a.plant && a.child_id === childId) {
                    plantMap[a.plant_id] = a.plant;
                  }
                });

                // Add plants from JSON data
                plantQuantities.forEach(plantData => {
                  const plant = plantMap[plantData.plant_id];
                  groupedAssignments[childId].plants.push({
                    name: plant ? plant.name : `Plant ID: ${plantData.plant_id}`,
                    category: plant ? plant.category : 'unknown',
                    quantity: plantData.quantity || 1,
                    status: plantData.status || 'active',
                    assigned_date: assignment.assigned_date,
                    plant_id: plantData.plant_id
                  });
                  groupedAssignments[childId].total_quantity += plantData.quantity || 1;
                });
              }
            }
          }
          
          groupedAssignments[childId].assignments.push(assignment);
        }
      });

      const assignments = Object.values(groupedAssignments);
      const totalPages = Math.ceil(count / limit);

      res.render('admin/assignments', {
        title: 'पौधा आवंटन',
        currentPage: 'assignments',
        assignments,
        originalAssignments: assignmentsList, // For stats calculations
        page: page,
        totalPages,
        totalAssignments: count,
        user: req.user,
        req: req
      });
    } catch (error) {
      console.error('Assignments Error:', error);
      res.status(500).render('error', { 
        title: 'त्रुटि',
        currentPage: 'error',
        message: 'आवंटन सूची लोड करने में त्रुटि हुई' 
      });
    }
  }

  // Plant Photos
  async photos(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const offset = (page - 1) * limit;
      const searchTerm = req.query.search || '';
      const categoryFilter = req.query.plant_category || '';

      // Build where conditions for search
      const whereConditions = {};
      const includeConditions = [
        { 
          model: PlantAssignment, 
          as: 'assignment',
          include: [
            { 
              model: Child, 
              as: 'child',
              where: searchTerm ? {
                [Op.or]: [
                  { mother_name: { [Op.like]: `%${searchTerm}%` } },
                  { child_name: { [Op.like]: `%${searchTerm}%` } }
                ]
              } : undefined
            },
            { 
              model: Plant, 
              as: 'plant',
              where: categoryFilter ? { category: categoryFilter } : undefined
            }
          ]
        }
      ];

      const { count, rows: photos } = await PlantPhoto.findAndCountAll({
        where: whereConditions,
        limit,
        offset,
        order: [['created_at', 'DESC']],
        include: includeConditions
      });

      // Calculate due dates and map data properly
      const photosWithDueDates = photos.map(photo => {
        let dueDate = null;
        if (photo.assignment && photo.assignment.assigned_date && photo.week_number) {
          const assignedDate = new Date(photo.assignment.assigned_date);
          dueDate = new Date(assignedDate.getTime() + (photo.week_number * 7 * 24 * 60 * 60 * 1000));
        }
        
        const photoData = photo.toJSON();
        return {
          ...photoData,
          due_date: dueDate,
          mother_name: photoData.assignment?.child?.mother_name || 'N/A',
          child_order: photoData.assignment?.child?.child_order || 'N/A',
          upload_date: photoData.upload_date || photoData.created_at,
          plant_category: photoData.assignment?.plant?.category || 'N/A'
        };
      });

      const totalPages = Math.ceil(count / limit);

      res.render('admin/photos', {
        title: 'फोटो प्रबंधन',
        currentPage: 'photos',
        photos: photosWithDueDates,
        page: page,
        currentPageNum: page,
        totalPages,
        totalPhotos: count,
        searchTerm,
        categoryFilter,
        user: req.user,
        req: req
      });
    } catch (error) {
      console.error('Photos Error:', error);
      res.status(500).render('error', { 
        title: 'त्रुटि',
        currentPage: 'error',
        message: 'फोटो सूची लोड करने में त्रुटि हुई' 
      });
    }
  }

  // Enhanced Reports with Dynamic Data
  async reports(req, res) {
    try {
      // Get real-time data for all sections
      const [
        totalMothers,
        totalAssignments, 
        totalPhotos,
        totalPlants,
        totalHospitals,
        totalDistricts,
        totalMitanins,
        totalReplacements,
        blockData,
        plantData,
        monthlyData,
        successRates
      ] = await Promise.all([
        // Count unique mothers (users with mother role) instead of counting children
        dbInstance.query(`
          SELECT COUNT(DISTINCT u.id) as count
          FROM tbl_user u
          INNER JOIN master_role r ON u.role_id = r.id
          WHERE r.name = 'mother'
          AND u.mobile IN (
            SELECT DISTINCT c.mother_mobile 
            FROM tbl_child c
          )
        `, {
          type: dbInstance.QueryTypes.SELECT
        }).then(result => result[0].count),
        PlantAssignment.count(),
        PlantPhoto.count(),
        Plant.count(),
        User.count({ where: { role_id: 2 } }), // Assuming role_id 2 is hospital
        District.count(),
        User.count({ where: { role_id: 3 } }), // Assuming role_id 3 is mitanin
        ReplacementRequest.count(),
        AdminController.getBlockAnalytics(),
        AdminController.getPlantAnalytics(),
        AdminController.getMonthlyAnalytics(),
        AdminController.getSuccessRates()
      ]);

      const dynamicData = {
        overview: {
          totalMothers,
          totalAssignments,
          totalPhotos,
          totalPlants,
          totalHospitals,
          totalDistricts,
          totalMitanins,
          totalReplacements,
          period: `${new Date().toLocaleDateString('hi-IN')}`
        },
        district: blockData,
        plant: plantData,
        monthly: monthlyData,
        success: successRates
      };

      res.render('admin/reports', {
        title: 'स्मार्ट रिपोर्ट्स',
        currentPage: 'reports',
        reports: dynamicData,
        reportType: 'overview', // Always show overview with all data
        dateRange: '30',
        user: req.user,
        req: req
      });
    } catch (error) {
      res.status(500).render('error', { 
        title: 'त्रुटि',
        currentPage: 'error',
        message: 'रिपोर्ट लोड करने में त्रुटि हुई' 
      });
    }
  }

  // Get District Analytics
  static async getDistrictAnalytics() {
    try {
      return await District.findAll({
        attributes: [
          'id',
          'name',
          [
            { fn: 'COUNT', args: [{ col: 'children.id' }] },
            'total_mothers'
          ]
        ],
        include: [
          {
            model: Child,
            as: 'children',
            attributes: [],
            required: false
          }
        ],
        group: ['District.id', 'District.name'],
        order: [[{ fn: 'COUNT', args: [{ col: 'children.id' }] }, 'DESC']],
        limit: 10
      });
    } catch (error) {
      return [];
    }
  }

  // Get Block Analytics
  static async getBlockAnalytics() {
    try {
      return await Block.findAll({
        attributes: [
          'id',
          'name',
          [
            { fn: 'COUNT', args: [{ col: 'children.id' }] },
            'total_mothers'
          ]
        ],
        include: [
          {
            model: Child,
            as: 'children',
            attributes: [],
            required: false
          }
        ],
        group: ['Block.id', 'Block.name'],
        order: [[{ fn: 'COUNT', args: [{ col: 'children.id' }] }, 'DESC']],
        limit: 10
      });
    } catch (error) {
      return [];
    }
  }

  // Get Plant Analytics  
  static async getPlantAnalytics() {
    try {
      return await Plant.findAll({
        attributes: [
          'id',
          'name',
          'category',
          [
            { fn: 'COUNT', args: [{ col: 'assignments.id' }] },
            'total_assignments'
          ]
        ],
        include: [
          {
            model: PlantAssignment,
            as: 'assignments',
            attributes: [],
            required: false
          }
        ],
        group: ['Plant.id', 'Plant.name', 'Plant.category'],
        order: [[{ fn: 'COUNT', args: [{ col: 'assignments.id' }] }, 'DESC']],
        limit: 10
      });
    } catch (error) {
      return [];
    }
  }

  // Get Monthly Analytics
  static async getMonthlyAnalytics() {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      
      // Get monthly registrations (unique mothers), assignments, and photos
      const [monthlyRegistrations, monthlyAssignments, monthlyPhotos] = await Promise.all([
        // Monthly unique mother registrations
        dbInstance.query(`
          SELECT 
            DATE_FORMAT(u.created_at, '%Y-%m') as month,
            COUNT(DISTINCT u.id) as registrations
          FROM tbl_user u
          INNER JOIN master_role r ON u.role_id = r.id
          WHERE r.name = 'mother'
          AND u.created_at >= ?
          AND u.mobile IN (
            SELECT DISTINCT c.mother_mobile 
            FROM tbl_child c
          )
          GROUP BY DATE_FORMAT(u.created_at, '%Y-%m')
          ORDER BY month ASC
        `, {
          replacements: [startDate],
          type: dbInstance.QueryTypes.SELECT
        }),
        
        // Monthly plant assignments
        PlantAssignment.findAll({
          attributes: [
            [{ fn: 'DATE_FORMAT', args: [{ col: 'created_at' }, '%Y-%m'] }, 'month'],
            [{ fn: 'COUNT', args: [{ col: 'id' }] }, 'assignments'],
          ],
          where: {
            created_at: {
              [Op.gte]: startDate
            }
          },
          group: [{ fn: 'DATE_FORMAT', args: [{ col: 'created_at' }, '%Y-%m'] }],
          order: [[{ fn: 'DATE_FORMAT', args: [{ col: 'created_at' }, '%Y-%m'] }, 'ASC']]
        }),
        
        // Monthly photo uploads
        PlantPhoto.findAll({
          attributes: [
            [{ fn: 'DATE_FORMAT', args: [{ col: 'created_at' }, '%Y-%m'] }, 'month'],
            [{ fn: 'COUNT', args: [{ col: 'id' }] }, 'photos'],
          ],
          where: {
            created_at: {
              [Op.gte]: startDate
            }
          },
          group: [{ fn: 'DATE_FORMAT', args: [{ col: 'created_at' }, '%Y-%m'] }],
          order: [[{ fn: 'DATE_FORMAT', args: [{ col: 'created_at' }, '%Y-%m'] }, 'ASC']]
        })
      ]);

      // Create a comprehensive month-by-month report
      const monthData = {};
      const months = [];
      
      // Generate last 7 months
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().substr(0, 7); // YYYY-MM format
        months.push(monthKey);
        monthData[monthKey] = {
          month: monthKey,
          registrations: 0,
          assignments: 0,
          photos: 0
        };
      }
      
      // Fill in actual data
      monthlyRegistrations.forEach(item => {
        if (monthData[item.month]) {
          monthData[item.month].registrations = parseInt(item.registrations);
        }
      });
      
      monthlyAssignments.forEach(item => {
        if (monthData[item.month]) {
          monthData[item.month].assignments = parseInt(item.assignments);
        }
      });
      
      monthlyPhotos.forEach(item => {
        if (monthData[item.month]) {
          monthData[item.month].photos = parseInt(item.photos);
        }
      });

      return months.map(month => monthData[month]);
    } catch (error) {
      return [];
    }
  }

  // Get Success Rates
  static async getSuccessRates() {
    try {
      const totalAssignments = await PlantAssignment.count();
      const successfulAssignments = await PlantAssignment.count({
        where: { status: 'completed' }
      });
      const totalPhotos = await PlantPhoto.count();
      const verifiedPhotos = await PlantPhoto.count({
        where: { is_verified: true }
      });

      return {
        assignmentSuccess: totalAssignments > 0 ? Math.round((successfulAssignments / totalAssignments) * 100) : 0,
        photoUpload: totalAssignments > 0 ? Math.round((totalPhotos / totalAssignments) * 100) : 0,
        verification: totalPhotos > 0 ? Math.round((verifiedPhotos / totalPhotos) * 100) : 0,
        replacement: 15 // This could be calculated based on replacement requests
      };
    } catch (error) {
      return {
        assignmentSuccess: 0,
        photoUpload: 0,
        verification: 0,
        replacement: 0
      };
    }
  }

  // Settings
  async settings(req, res) {
    try {
      res.render('admin/settings', {
        title: 'सेटिंग्स',
        currentPage: 'settings',
        user: req.user
      });
    } catch (error) {
      console.error('Settings Error:', error);
      res.status(500).render('error', { 
        title: 'त्रुटि',
        currentPage: 'error',
        message: 'सेटिंग्स लोड करने में त्रुटि हुई' 
      });
    }
  }

  // API endpoint for dashboard data (for AJAX updates)
  async getDashboardData(req, res) {
    try {
      const stats = await AdminController.getStats();
      const districtStats = await AdminController.getDistrictStats();
      const dailyStats = await AdminController.getDailyStats();
      const recentActivities = await AdminController.getRecentActivities();
      const realTimeData = await AdminController.getDashboardRealTimeData();

      res.json({
        success: true,
        data: {
          stats,
          districtStats,
          monthlyStats: dailyStats.dailyData,
          recentActivities,
          realTimeData,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Dashboard API Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard data',
        error: error.message
      });
    }
  }

  // Get User Details for Modal View
  async getUserDetails(req, res) {
    try {
      const userId = req.params.id;
      
      const user = await User.findByPk(userId, {
        include: [
          { 
            model: Role, 
            as: 'role'
          }
        ]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'उपयोगकर्ता नहीं मिला'
        });
      }

      res.json({
        success: true,
        user: user
      });
    } catch (error) {
      console.error('Get User Details Error:', error);
      res.status(500).json({
        success: false,
        message: 'उपयोगकर्ता विवरण लोड करने में त्रुटि हुई'
      });
    }
  }

  // New User Form
  async newUserForm(req, res) {
    try {
      const roles = await Role.findAll({
        where: {
          id: { [Op.in]: [2, 3, 4] } // Only district, hospital, mitanin roles
        }
      });

      const districts = await District.findAll({
        order: [['district_name', 'ASC']]
      });

      // Get default district (Raipur - lgd_district_code 387)
      const defaultDistrict = await District.findOne({
        where: { lgd_district_code: 387 }
      });

      // Get blocks for default district
      const blocks = await Block.findAll({
        where: { lgd_district_code: 387 },
        order: [['block_name', 'ASC']]
      });

      res.render('admin/user-form', {
        title: 'नया उपयोगकर्ता',
        currentPage: 'users',
        formUser: null,
        roles,
        districts,
        blocks,
        defaultDistrict,
        isEdit: false,
        user: req.user
      });
    } catch (error) {
      console.error('New User Form Error:', error);
      res.status(500).render('error', {
        title: 'त्रुटि',
        currentPage: 'error',
        message: 'नया उपयोगकर्ता फॉर्म लोड करने में त्रुटि हुई'
      });
    }
  }

  // Create User
  async createUser(req, res) {
    try {
      const { name, mobile, email, role_id, district_id, block_id, hospital_name, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { mobile: mobile },
            { email: email }
          ]
        }
      });

      if (existingUser) {
        req.flash('error', 'इस मोबाइल नंबर या ईमेल के साथ उपयोगकर्ता पहले से मौजूद है');
        return res.redirect('/admin/users/new');
      }

      // Create userid based on role
      let userid;
      const role = await Role.findByPk(role_id);
      if (role.name === 'district' || role.name === 'collector') {
        userid = `DIST-${mobile}`;
      } else if (role.name === 'hospital') {
        userid = `HOSP-${mobile}`;
      } else if (role.name === 'mitanin') {
        userid = `MIT-${mobile}`;
      }

      const newUser = await User.create({
        userid,
        name,
        mobile,
        email,
        password, // Will be hashed by the model
        role_id,
        district_id: 387, // Always Raipur district
        block_id: block_id || null,
        hospital_name: hospital_name || null,
        is_active: 1,
        is_password_changed: 0
      });

      req.flash('success', 'उपयोगकर्ता सफलतापूर्वक बनाया गया');
      res.redirect('/admin/users');
    } catch (error) {
      console.error('Create User Error:', error);
      req.flash('error', 'उपयोगकर्ता बनाने में त्रुटि हुई');
      res.redirect('/admin/users/new');
    }
  }

  // Edit User Form
  async editUserForm(req, res) {
    try {
      const userId = req.params.id;
      
      const formUser = await User.findByPk(userId, {
        include: [
          { model: Role, as: 'role' }
        ]
      });

      if (!formUser) {
        req.flash('error', 'उपयोगकर्ता नहीं मिला');
        return res.redirect('/admin/users');
      }

      const roles = await Role.findAll({
        where: {
          id: { [Op.in]: [2, 3, 4] } // Only district, hospital, mitanin roles
        }
      });

      const districts = await District.findAll({
        order: [['district_name', 'ASC']]
      });

      // Always get blocks for district 387 (Raipur)
      const blocks = await Block.findAll({
        where: { lgd_district_code: 387 },
        order: [['block_name', 'ASC']]
      });

      // Get default district for reference
      const defaultDistrict = await District.findOne({
        where: { lgd_district_code: 387 }
      });

      res.render('admin/user-form', {
        title: 'उपयोगकर्ता संपादित करें',
        currentPage: 'users',
        formUser: formUser,
        roles,
        districts,
        blocks,
        defaultDistrict,
        isEdit: true,
        user: req.user
      });
    } catch (error) {
      console.error('Edit User Form Error:', error);
      res.status(500).render('error', {
        title: 'त्रुटि',
        currentPage: 'error',
        message: 'उपयोगकर्ता संपादन फॉर्म लोड करने में त्रुटि हुई'
      });
    }
  }

  // Update User
  async updateUser(req, res) {
    try {
      const userId = req.params.id;
      const { name, mobile, email, role_id, district_id, block_id, hospital_name, password, is_active } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        req.flash('error', 'उपयोगकर्ता नहीं मिला');
        return res.redirect('/admin/users');
      }

      // Check if mobile/email already exists for other users
      const existingUser = await User.findOne({
        where: {
          id: { [Op.ne]: userId },
          [Op.or]: [
            { mobile: mobile },
            { email: email }
          ]
        }
      });

      if (existingUser) {
        req.flash('error', 'इस मोबाइल नंबर या ईमेल के साथ दूसरा उपयोगकर्ता पहले से मौजूद है');
        return res.redirect(`/admin/users/${userId}/edit`);
      }

      // Update user
      const updateData = {
        name,
        mobile,
        email,
        role_id,
        district_id: 387, // Always Raipur district
        block_id: block_id || null,
        hospital_name: hospital_name || null,
        is_active: is_active ? 1 : 0
      };

      // Only update password if provided
      if (password && password.trim() !== '') {
        updateData.password = password;
        updateData.is_password_changed = 0;
      }

      await user.update(updateData);

      req.flash('success', 'उपयोगकर्ता सफलतापूर्वक अपडेट किया गया');
      res.redirect('/admin/users');
    } catch (error) {
      console.error('Update User Error:', error);
      req.flash('error', 'उपयोगकर्ता अपडेट करने में त्रुटि हुई');
      res.redirect(`/admin/users/${req.params.id}/edit`);
    }
  }

  // Helper Methods
  static async getStats() {
    const [
      totalMothers,
      totalPlants,
      totalAssignments,
      totalPhotos,
      activeUsers,
      thisMonthMothers,
      completedAssignments,
      pendingAssignments,
      totalUsers,
      verifiedPhotos
    ] = await Promise.all([
      // Count unique mothers (users with mother role) instead of counting children
      dbInstance.query(`
        SELECT COUNT(DISTINCT u.id) as count
        FROM tbl_user u
        INNER JOIN master_role r ON u.role_id = r.id
        WHERE r.name = 'mother'
        AND u.mobile IN (
          SELECT DISTINCT c.mother_mobile 
          FROM tbl_child c
        )
      `, {
        type: dbInstance.QueryTypes.SELECT
      }).then(result => result[0].count),
      Plant.count(),
      PlantAssignment.count(),
      PlantPhoto.count(),
      User.count({ where: { is_active: true } }),
      // Count unique mothers registered this month
      dbInstance.query(`
        SELECT COUNT(DISTINCT u.id) as count
        FROM tbl_user u
        INNER JOIN master_role r ON u.role_id = r.id
        WHERE r.name = 'mother'
        AND u.mobile IN (
          SELECT DISTINCT c.mother_mobile 
          FROM tbl_child c
          WHERE c.created_at >= :startOfMonth
        )
      `, {
        replacements: { 
          startOfMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        },
        type: dbInstance.QueryTypes.SELECT
      }).then(result => result[0].count),
      PlantAssignment.count({ where: { status: 'completed' } }),
      PlantAssignment.count({ where: { status: 'active' } }),
      User.count(),
      PlantPhoto.count({ where: { is_verified: true } })
    ]);

    // Calculate growth percentages
    const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
    const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0);
    
    // Count unique mothers registered last month
    const lastMonthMothersResult = await dbInstance.query(`
      SELECT COUNT(DISTINCT u.id) as count
      FROM tbl_user u
      INNER JOIN master_role r ON u.role_id = r.id
      WHERE r.name = 'mother'
      AND u.mobile IN (
        SELECT DISTINCT c.mother_mobile 
        FROM tbl_child c
        WHERE c.created_at BETWEEN :lastMonthStart AND :lastMonthEnd
      )
    `, {
      replacements: { 
        lastMonthStart: lastMonthStart,
        lastMonthEnd: lastMonthEnd
      },
      type: dbInstance.QueryTypes.SELECT
    });
    const lastMonthMothers = lastMonthMothersResult[0].count;

    const mothersGrowth = lastMonthMothers > 0 ? 
      Math.round(((thisMonthMothers - lastMonthMothers) / lastMonthMothers) * 100) : 0;

    return {
      totalMothers,
      totalPlants,
      totalAssignments,
      totalPhotos,
      activeUsers,
      totalUsers,
      thisMonthMothers,
      completedAssignments,
      pendingAssignments,
      verifiedPhotos,
      mothersGrowth,
      assignmentCompletionRate: totalAssignments > 0 ? 
        Math.round((completedAssignments / totalAssignments) * 100) : 0,
      photoVerificationRate: totalPhotos > 0 ? 
        Math.round((verifiedPhotos / totalPhotos) * 100) : 0
    };
  }

  static async getDistrictStats() {
    try {
      const districtStats = await Child.findAll({
        attributes: [
          'district_code',
          [dbInstance.fn('COUNT', dbInstance.col('Child.id')), 'count']
        ],
        include: [
          {
            model: District,
            as: 'district',
            attributes: ['district_name'],
            required: true
          }
        ],
        group: ['district_code', 'district.district_name'],
        order: [[dbInstance.fn('COUNT', dbInstance.col('Child.id')), 'DESC']],
        limit: 10,
        raw: false
      });

      return districtStats.map(stat => ({
        name: stat.district?.district_name || 'Unknown',
        count: parseInt(stat.getDataValue('count')) || 0,
        district_code: stat.district_code
      }));
    } catch (error) {
      console.error('District stats error:', error);
      // Fallback to basic district list if query fails
      const districts = await District.findAll({
        attributes: ['district_code', 'district_name'],
        limit: 10
      });

      return districts.map(district => ({
        name: district.district_name,
        count: 0,
        district_code: district.district_code
      }));
    }
  }

  static async getMonthlyStats() {
    try {
      const currentYear = new Date().getFullYear();
      const months = [];
      
      // Get data for last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentYear, new Date().getMonth() - i, 1);
        const nextMonth = new Date(currentYear, new Date().getMonth() - i + 1, 1);
        
        const [registrationCount, assignmentCount] = await Promise.all([
          // Count unique mothers registered in this month
          dbInstance.query(`
            SELECT COUNT(DISTINCT u.id) as count
            FROM tbl_user u
            INNER JOIN master_role r ON u.role_id = r.id
            WHERE r.name = 'mother'
            AND u.mobile IN (
              SELECT DISTINCT c.mother_mobile 
              FROM tbl_child c
              WHERE c.created_at >= :startDate AND c.created_at < :endDate
            )
          `, {
            replacements: { 
              startDate: date,
              endDate: nextMonth
            },
            type: dbInstance.QueryTypes.SELECT
          }).then(result => result[0].count),
          PlantAssignment.count({
            where: {
              assigned_date: {
                [Op.gte]: date,
                [Op.lt]: nextMonth
              }
            }
          })
        ]);

        const monthNames = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 
                           'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];

        months.push({
          month: monthNames[date.getMonth()],
          registrations: registrationCount,
          assignments: assignmentCount,
          monthIndex: date.getMonth(),
          year: date.getFullYear()
        });
      }

      return {
        registrations: months.map(m => ({ month: m.month, count: m.registrations })),
        assignments: months.map(m => ({ month: m.month, count: m.assignments })),
        monthlyData: months
      };
    } catch (error) {
      console.error('Monthly stats error:', error);
      return { 
        registrations: [], 
        assignments: [],
        monthlyData: []
      };
    }
  }

  static async getRecentActivities() {
    try {
      const activities = [];
      
      // Get recent mother registrations
      const recentMothers = await Child.findAll({
        order: [['created_at', 'DESC']],
        limit: 5,
        attributes: ['id', 'mother_name', 'created_at']
      });

      // Get recent plant assignments
      const recentAssignments = await PlantAssignment.findAll({
        order: [['assigned_date', 'DESC']],
        limit: 5,
        include: [
          {
            model: Child,
            as: 'child',
            attributes: ['mother_name'],
            required: true
          },
          {
            model: Plant,
            as: 'plant',
            attributes: ['name'],
            required: true
          }
        ]
      });

      // Get recent photo uploads
      const recentPhotos = await PlantPhoto.findAll({
        order: [['upload_date', 'DESC']],
        limit: 3,
        include: [
          {
            model: PlantAssignment,
            as: 'assignment',
            include: [
              {
                model: Child,
                as: 'child',
                attributes: ['mother_name'],
                required: true
              }
            ],
            required: true
          }
        ]
      });

      // Add mother registrations to activities
      recentMothers.forEach(mother => {
        activities.push({
          id: `mother_${mother.id}`,
          title: 'नई माता पंजीकरण',
          description: `${mother.mother_name} का पंजीकरण हुआ`,
          created_at: mother.created_at,
          type: 'registration',
          icon: 'fas fa-user-plus',
          color: 'success'
        });
      });

      // Add plant assignments to activities
      recentAssignments.forEach(assignment => {
        activities.push({
          id: `assignment_${assignment.id}`,
          title: 'पौधा आवंटन',
          description: `${assignment.child?.mother_name} को ${assignment.plant?.name} पौधा आवंटित किया गया`,
          created_at: assignment.assigned_date,
          type: 'assignment',
          icon: 'fas fa-seedling',
          color: 'primary'
        });
      });

      // Add photo uploads to activities
      recentPhotos.forEach(photo => {
        activities.push({
          id: `photo_${photo.id}`,
          title: 'फोटो अपलोड',
          description: `${photo.assignment?.child?.mother_name} ने पौधे की फोटो अपलोड की`,
          created_at: photo.upload_date,
          type: 'photo',
          icon: 'fas fa-camera',
          color: 'info'
        });
      });

      // Sort all activities by date and return top 10
      return activities
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);

    } catch (error) {
      console.error('Recent activities error:', error);
      return [];
    }
  }

  // Add new method for real-time dashboard data
  static async getDashboardRealTimeData() {
    try {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const [
        todayRegistrations,
        todayAssignments,
        todayPhotos,
        pendingVerifications,
        overdueTasks
      ] = await Promise.all([
        // Count unique mothers registered today
        dbInstance.query(`
          SELECT COUNT(DISTINCT u.id) as count
          FROM tbl_user u
          INNER JOIN master_role r ON u.role_id = r.id
          WHERE r.name = 'mother'
          AND u.mobile IN (
            SELECT DISTINCT c.mother_mobile 
            FROM tbl_child c
            WHERE c.created_at >= :todayStart
          )
        `, {
          replacements: { 
            todayStart: todayStart
          },
          type: dbInstance.QueryTypes.SELECT
        }).then(result => result[0].count),
        PlantAssignment.count({
          where: {
            assigned_date: {
              [Op.gte]: todayStart
            }
          }
        }),
        PlantPhoto.count({
          where: {
            upload_date: {
              [Op.gte]: todayStart
            }
          }
        }),
        PlantPhoto.count({
          where: {
            is_verified: false
          }
        }),
        PlantAssignment.count({
          where: {
            status: 'active',
            assigned_date: {
              [Op.lt]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days old
            }
          }
        })
      ]);

      return {
        todayRegistrations,
        todayAssignments,
        todayPhotos,
        pendingVerifications,
        overdueTasks
      };
    } catch (error) {
      console.error('Real-time data error:', error);
      return {
        todayRegistrations: 0,
        todayAssignments: 0,
        todayPhotos: 0,
        pendingVerifications: 0,
        overdueTasks: 0
      };
    }
  }

  static async generateReports(type, dateRange) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    const reports = {};

    switch (type) {
      case 'overview':
        reports.overview = await AdminController.getOverviewReport(startDate, endDate);
        break;
      case 'district':
        reports.district = await AdminController.getDistrictReport(startDate, endDate);
        break;
      case 'plant':
        reports.plant = await AdminController.getPlantReport(startDate, endDate);
        break;
      default:
        reports.overview = await AdminController.getOverviewReport(startDate, endDate);
    }

    return reports;
  }

  static async getOverviewReport(startDate, endDate) {
    // Count unique mothers registered in the date range
    const totalMothersResult = await dbInstance.query(`
      SELECT COUNT(DISTINCT u.id) as count
      FROM tbl_user u
      INNER JOIN master_role r ON u.role_id = r.id
      WHERE r.name = 'mother'
      AND u.mobile IN (
        SELECT DISTINCT c.mother_mobile 
        FROM tbl_child c
        WHERE c.created_at BETWEEN :startDate AND :endDate
      )
    `, {
      replacements: { 
        startDate: startDate,
        endDate: endDate
      },
      type: dbInstance.QueryTypes.SELECT
    });
    const totalMothers = totalMothersResult[0].count;

    const totalAssignments = await PlantAssignment.count({
      where: {
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    const totalPhotos = await PlantPhoto.count({
      where: {
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    return {
      totalMothers,
      totalAssignments,
      totalPhotos,
      period: `${startDate.toLocaleDateString('hi-IN')} से ${endDate.toLocaleDateString('hi-IN')}`
    };
  }

  static async getDistrictReport(startDate, endDate) {
    return await District.findAll({
      attributes: [
        'id',
        'name',
        [
          { fn: 'COUNT', args: [{ col: 'children.id' }] },
          'total_mothers'
        ]
      ],
      include: [
        {
          model: Child,
          as: 'children',
          attributes: [],
          where: {
            created_at: {
              [Op.between]: [startDate, endDate]
            }
          },
          required: false
        }
      ],
      group: ['District.id', 'District.name'],
      order: [[{ fn: 'COUNT', args: [{ col: 'children.id' }] }, 'DESC']]
    });
  }

  static async getPlantReport(startDate, endDate) {
    return await Plant.findAll({
      attributes: [
        'id',
        'name',
        'category',
        [
          { fn: 'COUNT', args: [{ col: 'assignments.id' }] },
          'total_assignments'
        ]
      ],
      include: [
        {
          model: PlantAssignment,
          as: 'assignments',
          attributes: [],
          where: {
            created_at: {
              [Op.between]: [startDate, endDate]
            }
          },
          required: false
        }
      ],
      group: ['Plant.id', 'Plant.name', 'Plant.category'],
      order: [[{ fn: 'COUNT', args: [{ col: 'assignments.id' }] }, 'DESC']]
    });
  }

  static async getDailyStats() {
    try {
      const days = [];
      
      // Get data for last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const [registrationCount, assignmentCount] = await Promise.all([
          // Count unique mothers registered on this day
          dbInstance.query(`
            SELECT COUNT(DISTINCT u.id) as count
            FROM tbl_user u
            INNER JOIN master_role r ON u.role_id = r.id
            WHERE r.name = 'mother'
            AND u.mobile IN (
              SELECT DISTINCT c.mother_mobile 
              FROM tbl_child c
              WHERE c.created_at >= :startDate AND c.created_at < :endDate
            )
          `, {
            replacements: { 
              startDate: date,
              endDate: nextDay
            },
            type: dbInstance.QueryTypes.SELECT
          }).then(result => result[0].count),
          PlantAssignment.count({
            where: {
              assigned_date: {
                [Op.gte]: date,
                [Op.lt]: nextDay
              }
            }
          })
        ]);

        const dayNames = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
        const dayOfWeek = dayNames[date.getDay()];
        const dateStr = date.getDate() + '/' + (date.getMonth() + 1);

        days.push({
          date: dateStr,
          day: dayOfWeek,
          registrations: registrationCount,
          assignments: assignmentCount,
          fullDate: date.toISOString()
        });
      }

      return {
        registrations: days.map(d => ({ date: d.date, count: d.registrations })),
        assignments: days.map(d => ({ date: d.date, count: d.assignments })),
        dailyData: days
      };
    } catch (error) {
      console.error('Daily stats error:', error);
      return { 
        registrations: [], 
        assignments: [],
        dailyData: []
      };
    }
  }

  // Add Plant Form
  async addPlantForm(req, res) {
    try {
      res.render('admin/add-plant', {
        title: 'नया पौधा जोड़ें',
        currentPage: 'plants',
        user: req.user,
        req: req
      });
    } catch (error) {
      console.error('Add Plant Form Error:', error);
      res.status(500).render('error', { 
        title: 'त्रुटि',
        currentPage: 'error',
        message: 'पौधा जोड़ने का फॉर्म लोड करने में त्रुटि हुई' 
      });
    }
  }

  // Create Plant
  async createPlant(req, res) {
    try {
      const { name, species, category, local_name, description, care_instructions, growth_period_months } = req.body;
      
      // Handle image upload
      let image_url = null;
      if (req.file) {
        image_url = `/images/${req.file.filename}`;
      }

      const plant = await Plant.create({
        name,
        species,
        category,
        local_name,
        description,
        care_instructions,
        growth_period_months: parseInt(growth_period_months) || 12,
        image_url,
        is_active: true
      });

      req.flash('success', 'पौधा सफलतापूर्वक जोड़ा गया');
      res.redirect('/admin/plants');
    } catch (error) {
      console.error('Create Plant Error:', error);
      req.flash('error', 'पौधा जोड़ने में त्रुटि हुई');
      res.redirect('/admin/plants/add');
    }
  }

  // Edit Plant Form
  async editPlantForm(req, res) {
    try {
      const plantId = req.params.id;
      const plant = await Plant.findByPk(plantId);

      if (!plant) {
        req.flash('error', 'पौधा नहीं मिला');
        return res.redirect('/admin/plants');
      }

      res.render('admin/edit-plant', {
        title: 'पौधा संपादित करें',
        currentPage: 'plants',
        plant,
        user: req.user,
        req: req
      });
    } catch (error) {
      console.error('Edit Plant Form Error:', error);
      res.status(500).render('error', { 
        title: 'त्रुटि',
        currentPage: 'error',
        message: 'पौधा संपादन फॉर्म लोड करने में त्रुटि हुई' 
      });
    }
  }

  // Update Plant
  async updatePlant(req, res) {
    try {
      const plantId = req.params.id;
      const { name, species, category, local_name, description, care_instructions, growth_period_months } = req.body;

      const plant = await Plant.findByPk(plantId);
      if (!plant) {
        req.flash('error', 'पौधा नहीं मिला');
        return res.redirect('/admin/plants');
      }

      // Handle image upload
      let image_url = plant.image_url; // Keep existing image if no new one uploaded
      if (req.file) {
        image_url = `/images/${req.file.filename}`;
        
        // TODO: Delete old image file if exists
        // You can add logic here to delete the old image file from filesystem
      }

      await plant.update({
        name,
        species,
        category,
        local_name,
        description,
        care_instructions,
        growth_period_months: parseInt(growth_period_months) || 12,
        image_url
      });

      req.flash('success', 'पौधा सफलतापूर्वक अपडेट किया गया');
      res.redirect('/admin/plants');
    } catch (error) {
      console.error('Update Plant Error:', error);
      req.flash('error', 'पौधा अपडेट करने में त्रुटि हुई');
      res.redirect(`/admin/plants/${req.params.id}/edit`);
    }
  }

  // Delete Plant
  async deletePlant(req, res) {
    try {
      const plantId = req.params.id;
      const plant = await Plant.findByPk(plantId);

      if (!plant) {
        return res.status(404).json({
          success: false,
          message: 'पौधा नहीं मिला'
        });
      }

      // Check if plant has been assigned to any mothers
      const assignmentCount = await PlantAssignment.count({
        where: {
          plant_id: plantId
        }
      });

      if (assignmentCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'यह पौधा माताओं को आवंटित किया गया है, इसलिए इसे हटाया नहीं जा सकता'
        });
      }

      await plant.destroy();

      res.json({
        success: true,
        message: 'पौधा सफलतापूर्वक हटाया गया'
      });
    } catch (error) {
      console.error('Delete Plant Error:', error);
      res.status(500).json({
        success: false,
        message: 'पौधा हटाने में त्रुटि हुई'
      });
    }
  }

  // New Plant Assignment Form
  async newAssignmentForm(req, res) {
    try {
      const childId = req.query.child_id;
      
      // Get child details if childId is provided
      let child = null;
      if (childId) {
        child = await Child.findByPk(childId, {
          include: [
            { model: User, as: 'hospital' },
            { model: Block, as: 'block' }
          ]
        });
      }

      // Get all available plants
      const plants = await Plant.findAll({
        where: { is_active: true },
        order: [['name', 'ASC']]
      });

      // Get all children if childId not provided
      const children = childId ? [] : await Child.findAll({
        where: { is_active: true },
        include: [
          { model: User, as: 'hospital' },
          { model: Block, as: 'block' }
        ],
        order: [['mother_name', 'ASC']]
      });

      res.render('admin/assignment-new', {
        title: 'नया पौधा आवंटन',
        currentPage: 'assignments',
        child,
        children,
        plants,
        user: req.user
      });
    } catch (error) {
      console.error('New Assignment Form Error:', error);
      res.status(500).render('error', {
        title: 'त्रुटि',
        currentPage: 'error',
        message: 'आवंटन फॉर्म लोड करने में त्रुटि हुई'
      });
    }
  }

  // Create Plant Assignment
  async createAssignment(req, res) {
    try {
      const { child_id, plant_id, assigned_date, quantity } = req.body;

      // Validate input
      if (!child_id || !plant_id) {
        req.flash('error', 'बच्चा और पौधा दोनों का चयन आवश्यक है');
        return res.redirect('/admin/assignments/new');
      }

      // Check if child exists
      const child = await Child.findByPk(child_id);
      if (!child) {
        req.flash('error', 'बच्चे की जानकारी नहीं मिली');
        return res.redirect('/admin/assignments/new');
      }

      // Check if plant exists
      const plant = await Plant.findByPk(plant_id);
      if (!plant) {
        req.flash('error', 'पौधे की जानकारी नहीं मिली');
        return res.redirect('/admin/assignments/new');
      }

      // Create assignment
      const assignment = await PlantAssignment.create({
        child_id: child_id,
        plant_id: plant_id,
        assigned_date: assigned_date || new Date(),
        quantity: quantity || 1,
        status: 'active',
        assigned_by: req.user.id
      });

      // Generate proper tracking schedules (8 total: 4 weekly + 2 bi-weekly + 2 bi-weekly)
      await generateTrackingSchedule(assignment.id, assigned_date || new Date());

      req.flash('success', 'पौधा सफलतापूर्वक आवंटित किया गया');
      res.redirect('/admin/assignments');
    } catch (error) {
      console.error('Create Assignment Error:', error);
      req.flash('error', 'पौधा आवंटन करने में त्रुटि हुई');
      res.redirect('/admin/assignments/new');
    }
  }

  // Child Plant Tracking
  async childPlantTracking(req, res) {
    try {
      const childId = req.params.id;

      // Get child details
      const child = await Child.findByPk(childId, {
        include: [
          { model: User, as: 'hospital' },
          { model: User, as: 'mitanin' },
          { model: Block, as: 'block' },
          { model: District, as: 'district' }
        ]
      });

      if (!child) {
        return res.status(404).render('error', {
          title: 'त्रुटि',
          currentPage: 'error',
          message: 'बच्चे की जानकारी नहीं मिली'
        });
      }

      // Get all plant assignments for this child
      const assignments = await PlantAssignment.findAll({
        where: { child_id: childId },
        include: [
          { 
            model: Plant, 
            as: 'plant' 
          },
          {
            model: PlantTrackingSchedule,
            as: 'trackingSchedules',
            include: [
              {
                model: PlantPhoto,
                as: 'photo',
                required: false
              }
            ],
            order: [['week_number', 'ASC']]
          },
          {
            model: PlantPhoto,
            as: 'photos',
            order: [['created_at', 'DESC']]
          }
        ]
      });

      // Group tracking data by month and week
      const trackingData = assignments.map(assignment => {
        const monthlyData = {};
        
        assignment.trackingSchedules.forEach(schedule => {
          if (!monthlyData[schedule.month_number]) {
            monthlyData[schedule.month_number] = [];
          }
          monthlyData[schedule.month_number].push(schedule);
        });

        return {
          assignment,
          monthlyData,
          totalPhotos: assignment.photos.length
        };
      });

      res.render('admin/child-tracking', {
        title: `${child.mother_name} - पौधा ट्रैकिंग`,
        currentPage: 'children',
        child,
        trackingData,
        user: req.user
      });
    } catch (error) {
      console.error('Child Plant Tracking Error:', error);
      res.status(500).render('error', {
        title: 'त्रुटि',
        currentPage: 'error',
        message: 'ट्रैकिंग डेटा लोड करने में त्रुटि हुई'
      });
    }
  }

  // Plant Photos

  // Delete Photo
  async deletePhoto(req, res) {
    try {
      const photoId = req.params.id;
      
      const photo = await PlantPhoto.findByPk(photoId, {
        include: [
          { 
            model: PlantAssignment, 
            as: 'assignment',
            include: [
              { model: Child, as: 'child' }
            ]
          }
        ]
      });

      if (!photo) {
        return res.status(404).json({
          success: false,
          message: 'फोटो नहीं मिली'
        });
      }

      // Update tracking schedule status if photo was linked
      if (photo.assignment) {
        await PlantTrackingSchedule.update(
          { 
            upload_status: 'pending',
            photo_id: null,
            completed_date: null
          },
          { 
            where: { 
              assignment_id: photo.assignment_id,
              week_number: photo.week_number
            }
          }
        );
      }

      // Delete the photo record
      await photo.destroy();

      res.json({
        success: true,
        message: 'फोटो सफलतापूर्वक हटा दी गई'
      });
    } catch (error) {
      console.error('Delete Photo Error:', error);
      res.status(500).json({
        success: false,
        message: 'फोटो हटाने में त्रुटि हुई'
      });
    }
  }
}

module.exports = new AdminController();
