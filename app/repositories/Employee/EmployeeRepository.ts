import { formatDynamoKeys } from "../../lib/helpers/primaryKey";
import { IEmployeePrimaryKeyParams, IPersistEmployeeParams } from "../../models/Employee";
import { EmployeeDBModel } from "../../models/tables/Employee/EmployeeDBModel";


export const EmployeeRepository = {
    persist: async({primaryKeys: {locationId, id}, attr}: IPersistEmployeeParams) => {
        const primaryKey = formatDynamoKeys({pk: { locationId }, sk: { id }})

        const Employee = new EmployeeDBModel({
            ...primaryKey,
            ...attr
        })

        console.log(Employee)

        return await Employee.save()
    },

    getByLocation: async(locationId: string) => {
        const primaryKey = formatDynamoKeys({pk: { locationId }})
        return await EmployeeDBModel.query('pk')
        .eq(primaryKey.pk)
        .exec()
    },

    getById: async({ locationId, id }: IEmployeePrimaryKeyParams) => {

        const primaryKey = formatDynamoKeys({pk: { locationId }, sk: { id }})

        return await EmployeeDBModel.get(primaryKey)

    },
    deleteById: async ({ locationId, id }: IEmployeePrimaryKeyParams) => {
        const primaryKey = formatDynamoKeys({pk: { locationId }, sk: { id }})
        return await EmployeeDBModel.delete(primaryKey)
    }
}