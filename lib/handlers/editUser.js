/**
 * Edit user details
 *
 * POST: /users
 * 
 * query:
 *   email
 *   
 */

const User = require('../../models/user');

exports.handler = async function editUser(req, res, next) {
  const { userId: id, } = req;
  const {
    firstName: newFirstName,
    lastName: newLastName,
    joinDate: newJoinDate,
    memberId: newMemberId,
    prevSavingsAmount: newPrevSavingsAmount,
    prevSavingsDate: newPrevSavingsDate,
    nextSavingsDate: newNextSavingsDate,
    nextSavingsAmount: newNextSavingsAmount,
    savingsDateAndAmountApproval: newsavingsDateAndAmountApproval,
    position: newPosition,
    phone: newPhone,
    status: newStatus,
    isGuarantor: newIsGuarantor,
  } = req.body

  try {
    let updatedDetails
    // Update user details
    updatedDetails = await User.updateDetails(
      id,
      newFirstName,
      newLastName,
      newJoinDate,
      newMemberId,
      newPrevSavingsDate,
      newPrevSavingsAmount,
      newNextSavingsDate,
      newNextSavingsAmount,
      newsavingsDateAndAmountApproval,
      newPosition,
      newPhone,
      newStatus,
      newIsGuarantor,
    );
    return res.json({
      success: true,
      message: 'User data updated',
      data: updatedDetails
    })

  } catch (error) {
    // Catch and return errors
    next(error);
  }
}
