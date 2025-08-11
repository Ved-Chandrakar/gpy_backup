const { DataTypes } = require('sequelize');

/**
 * Migration to add additional fields to mother registration
 * - birth_certificate: "Kya birth certificate mila?" (Yes/No)
 * - is_shramik_card: "Kya shramik card bana hua hai?" (Yes/No)
 * - is_used_ayushman_card: "Kya is delivery ke liye Ayushman card ka prayog hua?" (Yes/No)
 * - ayushman_card_amount: "Agar haan, toh kitna amount tak ka hua?" (number)
 * - is_benefit_nsy: "Kya vo Nauni Suraksha Yojna ke antargat aati hai?" (for female child)
 * - is_nsy_form: "Aur agar haan, toh form mila hai?" (for female child)
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🚀 Adding additional mother registration fields to tbl_child...');
    
    try {
      // Add birth_certificate field
      await queryInterface.addColumn('tbl_child', 'birth_certificate', {
        type: DataTypes.ENUM('yes', 'no'),
        allowNull: true,
        comment: 'क्या birth certificate मिला? (हां/नहीं)'
      });
      console.log('✅ Added birth_certificate column');

      // Add is_shramik_card field
      await queryInterface.addColumn('tbl_child', 'is_shramik_card', {
        type: DataTypes.ENUM('yes', 'no'),
        allowNull: true,
        comment: 'क्या श्रमिक कार्ड बना हुआ है? (हां/नहीं)'
      });
      console.log('✅ Added is_shramik_card column');

      // Add is_used_ayushman_card field
      await queryInterface.addColumn('tbl_child', 'is_used_ayushman_card', {
        type: DataTypes.ENUM('yes', 'no'),
        allowNull: true,
        comment: 'क्या इस delivery के लिए आयुष्मान कार्ड का प्रयोग हुआ? (हां/नहीं)'
      });
      console.log('✅ Added is_used_ayushman_card column');

      // Add ayushman_card_amount field
      await queryInterface.addColumn('tbl_child', 'ayushman_card_amount', {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'आयुष्मान कार्ड की राशि (यदि उपयोग हुआ हो)'
      });
      console.log('✅ Added ayushman_card_amount column');

      // Add is_benefit_nsy field (for female children)
      await queryInterface.addColumn('tbl_child', 'is_benefit_nsy', {
        type: DataTypes.ENUM('yes', 'no'),
        allowNull: true,
        comment: 'क्या वो नन्नी सुरक्षा योजना के अंतर्गत आती है? (केवल बालिका के लिए)'
      });
      console.log('✅ Added is_benefit_nsy column');

      // Add is_nsy_form field (for female children)
      await queryInterface.addColumn('tbl_child', 'is_nsy_form', {
        type: DataTypes.ENUM('yes', 'no'),
        allowNull: true,
        comment: 'NSY फॉर्म मिला है? (केवल बालिका के लिए)'
      });
      console.log('✅ Added is_nsy_form column');

      console.log('🎉 Successfully added all additional mother registration fields to tbl_child');
      
    } catch (error) {
      console.error('❌ Error adding additional mother registration fields:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Removing additional mother registration fields from tbl_child...');
    
    try {
      await queryInterface.removeColumn('tbl_child', 'birth_certificate');
      console.log('✅ Removed birth_certificate column');

      await queryInterface.removeColumn('tbl_child', 'is_shramik_card');
      console.log('✅ Removed is_shramik_card column');

      await queryInterface.removeColumn('tbl_child', 'is_used_ayushman_card');
      console.log('✅ Removed is_used_ayushman_card column');

      await queryInterface.removeColumn('tbl_child', 'ayushman_card_amount');
      console.log('✅ Removed ayushman_card_amount column');

      await queryInterface.removeColumn('tbl_child', 'is_benefit_nsy');
      console.log('✅ Removed is_benefit_nsy column');

      await queryInterface.removeColumn('tbl_child', 'is_nsy_form');
      console.log('✅ Removed is_nsy_form column');

      console.log('🎉 Successfully removed all additional mother registration fields from tbl_child');
      
    } catch (error) {
      console.error('❌ Error removing additional mother registration fields:', error);
      throw error;
    }
  }
};
