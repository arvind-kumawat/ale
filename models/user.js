const Sequelize = require('sequelize');
const sequelize = require('./connection');
const { AleError, codes } = require('../lib/errors');
const { compareHashAndTextPassword } = require('../lib/helpers/auth');

/**
 * An user is an individual authorised to use the application.  
 */
const User = sequelize.define('user', {
  firstName: { type: Sequelize.STRING, notNull: true },
  lastName: { type: Sequelize.STRING, notNull: true },
  email: { type: Sequelize.STRING, notNull: true, unique: { msg: 'Email already exists' } },
  userName: { type: Sequelize.STRING, notNull: true },
  password: { type: Sequelize.STRING, notNull: true },
  isAdmin: { type: Sequelize.BOOLEAN, notNull: true },
  joinDate: { type: Sequelize.DATE },
  memberId: { type: Sequelize.STRING, notNull: true, unique: { msg: 'MemberId already exists' } },
  prevSavingsDate: { type: Sequelize.INTEGER },
  prevSavingsAmount: { type: Sequelize.FLOAT },
  nextSavingsDate: { type: Sequelize.INTEGER },
  nextSavingsAmount: { type: Sequelize.FLOAT },
  savingsDateAndAmountApproval: { type: Sequelize.STRING },
  position: { type: Sequelize.STRING },
  phone: { type: Sequelize.STRING },
  status: { type: Sequelize.STRING },
  isGuarantor: { type: Sequelize.BOOLEAN },
  organization: { type: Sequelize.STRING },
});

/**
 * Gets an existing user, or creates a new one
 * @param firstName The first name of the candidate user
 * @param lastName The last name of the candidate user
 * @param email The email of the candidate user
 * @param userName The username of the candidate user
 * @param password The password of the candidate user
 * @param joinDate The date the candidate user joined the cooperative
 * @param memberId The candidate user's member ID
 * @param nextSavingsDate The next due date of the candidate user
 * @param nextSavingsAmount The next savings amount of the candidate user
 * @param position The postion of the candidate user
 * @param phone The phone number of the candidate user
 * @param status The status of the candidate user
 * @param isGuarantor If the user is currently a guarantor
 * @param organization The organization of the user
 * 
 */
User.getOrCreateUser = function (firstName, lastName, email, userName, password, isAdmin, joinDate, memberId, nextSavingsDate, nextSavingsAmount, position, phone, status, isGuarantor, organization) {
  return User.findOrCreate({ where: { email }, defaults: { firstName, lastName, userName, password, isAdmin, joinDate, memberId, nextSavingsDate, nextSavingsAmount, position, phone, status, isGuarantor, organization } })
    .then(result => {
      if (!result || result.length != 2) {
        return sequelize.Promise.reject(new AleError('User query failed to return expected result', codes.DatabaseQueryError));
      }
      const user = result[0];
      const isNewUser = result[1];
      return { isNew: isNewUser, user };
    });
};

/**
 * Gets auth for an existing user
 * @param userName The name of the user
 * @param password The password of the user
 */
User.getUserByAuth = function (email, password) {
  return User.find({ where: { email }, attributes: ['id', 'firstName', 'lastName', 'userName', 'email', 'organization', 'password', 'isAdmin', 'position'] })
    .then(result => {
      if (!result) {
        return sequelize.Promise.reject(new AleError('User with email does not exist', codes.DatabaseQueryError));
      }
      const comparePassword = compareHashAndTextPassword(result.password, password)
      if (!comparePassword) {
        return sequelize.Promise.reject(new AleError('Password is incorrect', codes.DatabaseQueryError));
      }
      return result;
    });
};

/**
 * Gets details for an existing user
 * @param userId The name of the user
 */
User.getUserDetails = async function (userId) {
  try {
    const result = await User.find({ attributes: { exclude: ['password'] }, where: { id: userId } });
    if (!result) {
      return sequelize.Promise.reject(new AleError('User with id does not exist', codes.DatabaseQueryError));
    }
    return result;
  } catch (error) {
    return sequelize.Promise.reject(new AleError(error, codes.DatabaseQueryError));
  }
};

/**
 * Gets details for an existing user by memberId
 * @param memberId The name of the user
 */
User.getUserDetailsByMemberId = async function (memberId) {
  try {
    const result = await User.find({ attributes: { exclude: ['password'] }, where: { memberId } });
    if (!result) {
      return sequelize.Promise.reject(new AleError('User with member id does not exist', codes.DatabaseQueryError));
    }
    return result;
  } catch (error) {
    return sequelize.Promise.reject(new AleError(error, codes.DatabaseQueryError));
  }
};



/**
 * Update details for an existing user
 * 
 */
User.updateDetails = async function (
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
) {
  try {
    const priorDetails = await User.findOne({ where: { id } });
    const newIsGuarantorObj = { isGuarantor: newIsGuarantor }
    const result = await User.update(
      {
        firstName: newFirstName || priorDetails.firstName, lastName: newLastName || priorDetails.lastName,
        joinDate: newJoinDate || priorDetails.joinDate, memberId: newMemberId || priorDetails.memberId,
        prevSavingsDate: newPrevSavingsDate || priorDetails.newPrevSavingsAmount, prevSavingsAmount: newPrevSavingsAmount || priorDetails.newPrevSavingsAmount,
        nextSavingsDate: newNextSavingsDate || priorDetails.nextSavingsDate, nextSavingsAmount: newNextSavingsAmount || priorDetails.nextSavingsAmount,
        savingsDateAndAmountApproval: newsavingsDateAndAmountApproval || priorDetails.newsavingsDateAndAmountApproval,
        position: newPosition || priorDetails.position, phone: newPhone || priorDetails.phone,
        status: newStatus || priorDetails.status, isGuarantor: newIsGuarantorObj["isGuarantor"] === undefined ? priorDetails.isGuarantor : newIsGuarantorObj["isGuarantor"],
      },
      {
        where: { id },
        returning: true,
        plain: true,
      }
    );


    if (!result) {
      return sequelize.Promise.reject(new AleError('Unable to update record at this time', codes.DatabaseQueryError));
    }
    return result[1];
  } catch (error) {
    return sequelize.Promise.reject(new AleError(error, codes.DatabaseQueryError));
  }
};

/**
 * Update details for an existing user by admin
 * 
 */
User.adminUpdateDetails = async function (
  memberId,
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
) {
  try {

    priorDetails = await User.findOne({ where: { memberId } });
    const newIsGuarantorObj = { isGuarantor: newIsGuarantor }
    const result = await User.update(
      {
        firstName: newFirstName || priorDetails.firstName, lastName: newLastName || priorDetails.lastName,
        joinDate: newJoinDate || priorDetails.joinDate, memberId: newMemberId || priorDetails.memberId,
        prevSavingsDate: newPrevSavingsDate || priorDetails.newPrevSavingsAmount, prevSavingsAmount: newPrevSavingsAmount || priorDetails.newPrevSavingsAmount,
        nextSavingsDate: newNextSavingsDate || priorDetails.nextSavingsDate, nextSavingsAmount: newNextSavingsAmount || priorDetails.nextSavingsAmount,
        savingsDateAndAmountApproval: newsavingsDateAndAmountApproval || priorDetails.newsavingsDateAndAmountApproval,
        position: newPosition || priorDetails.position, phone: newPhone || priorDetails.phone,
        status: newStatus || priorDetails.status, isGuarantor: newIsGuarantorObj["isGuarantor"] === undefined ? priorDetails.isGuarantor : newIsGuarantorObj["isGuarantor"],
      },
      {
        where: { memberId },
        returning: true,
        plain: true,
      }
    );


    if (!result) {
      return sequelize.Promise.reject(new AleError('Unable to update record at this time', codes.DatabaseQueryError));
    }
    return result[1];
  } catch (error) {
    return sequelize.Promise.reject(new AleError(error, codes.DatabaseQueryError));
  }
};


/**
 * Gets details of all users
 * @param userId The name of the user
 */
User.getAllDetails = async function (isAdmin) {
  try {
    let allUsers;
    if (isAdmin) {
      allUsers = User.findAll({
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
      });
    } else {
      allUsers = User.findAll({
        attributes: ['id', 'firstName', 'lastName', 'memberId']
      });
    }
    if (!allUsers) {
      return sequelize.Promise.reject(new AleError('Unable to get all users', codes.DatabaseQueryError));
    }
    return allUsers;
  } catch (error) {
    return sequelize.Promise.reject(new AleError(error, codes.DatabaseQueryError));
  }
};

module.exports = User;
