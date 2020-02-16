import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
const Schema = mongoose.Schema;
/**
 * ReqJson Schema
 */
const ReqJsonSchema = new mongoose.Schema({
	displayName: {
		type: String
	},
	email: {
		type: String
	},
	method: {
		type: String
	},
	json: {
		type: Object
	},
	url: {
		type: String
	},
	created: {
		type: Date,
		default: Date.now
	},
	createdBy: {
		user: {
			type: Schema.ObjectId,
			ref: "User"
		},
		employee: {
			type: Schema.ObjectId,
			ref: 'Employee'
		}
	},
	active: {
		type: Boolean,
		default: true
	},
	fullReq: {
		type: Object
	},
},
	{
		usePushEach: true
	});

/**
 * Statics
 */
ReqJsonSchema.statics = {
	/**
	 * save and update reqJsons
	 * @param reqJsons
	 * @returns {Promise<reqJsons, APIError>}
	 */
	save(reqJson) {
		return reqJson.save()
			.then((reqJson) => {
				if (reqJson) {
					return reqJson;
				}
				const err = new APIError('Error in reqJson', httpStatus.NOT_FOUND);
				return Promise.reject(err);
			});
	},

	/**
	 * Get reqJson
	 * @param {ObjectId} id - The objectId of reqJson.
	 * @returns {Promise<reqJson, APIError>}
	 */
	get(id) {
		return this.findById(id)
			.exec()
			.then((reqJson) => {
				if (reqJson) {
					return reqJson;
				}
				const err = new APIError('No such reqJson exists!', httpStatus.NOT_FOUND);
				return Promise.reject(err);
			});
	},

	/**
	 * List reqJson in descending order of 'createdAt' timestamp.
	 * @returns {Promise<reqJson[]>}
	 */
	list(query) {
		return this.find(query.filter)
			.populate("createdBy updatedBy", 'firstName lastName displayName')
			.sort(query.sorting)
			.skip((query.page - 1) * query.limit)
			.limit(query.limit)
			.exec();
	},

	/**
	 * Count of reqJson records
	 * @returns {Promise<reqJson[]>}
	 */
	totalCount(query) {
		return this.find(query.filter)
			.count();
	}

};

/**
 * @typedef reqJson
 */
export default mongoose.model('ReqJson', ReqJsonSchema);
