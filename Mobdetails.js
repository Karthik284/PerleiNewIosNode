const oracle = require("oracledb")
const dbconfig = require("./dbconfig.js");
const { response } = require("express");
const moment = require('moment');
const crypto = require('crypto');
const { log } = require("console");


async function registerget(id, empname) {
    let connection, sql, binds2, result, options, resultObj
    try {
        sql = `select idcardno,empname,empid,panno,dob,doj,UNDERHEADEMPID from empma where 
        type = 'STAFF' and  empname liKE '%${empname}%' and idcardno = '${id}'`
        connection = await oracle.getConnection(dbconfig);
        binds2 = {}
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        }
        result = await connection.execute(sql, binds2, options)
        if (result.rows.length > 0) {
            resultObj = { valid: true, values: result.rows }
        } else {
            resultObj = { valid: false }
        }
        return resultObj
    } catch (e) {
        console.log("registerget", e.message);
        return resultObj = { valid: false }
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("Error registerget", e.message);
        }
    }
};

async function ResigistinsertData(val) {
    let connection, sql, binds2, options, result, resultObj1, result5
    try {

        console.log(val, "register")
        connection = await oracle.getConnection(dbconfig)
        // sql = `select panno,empmaid,empname from empma where idcardno= ${val.IDCARDNO}`
        // binds2 = {}
        // options = {
        //     outFormat: oracle.OUT_FORMAT_OBJECT
        // }
        // let result2 = await connection.execute(sql, binds2, options)

        // if (result2.rows.length === 0) {
        //     return { status: false, message: "Not a valid IDcard number. Please provide the correct IDcard number." }
        // }

        // sql = `select deviceid from MOBILE_APP_USERS where where deviceid = '${val.DEVICEID}' and idcardno= ${val.IDCARDNO}`
        // let result6 = await connection.execute(sql, binds2, options)

        // if (result6.rows.length === 0) {
        //     return { status: false, message: "Not a valid deviceID" }
        // }

        sql = `select idcardno, deviceid from MOBILE_APP_USERS where idcardno= ${val.IDCARDNO} and dob = TO_DATE('${val.DOB}', 'YYYY-MM-DD')`;
        binds2 = {}
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        }

        let result4 = await connection.execute(sql, binds2, options)

        if (result4.rows.length > 0) {
            if (result4.rows[0].DEVICEID !== val.DEVICEID) {
                return ({ status: false, message: "User already registered with different device" });
            } else {
                sql = `UPDATE MOBILE_APP_USERS SET password = '${val.PASSWORD}' WHERE  idcardno= '${val.IDCARDNO}' and 
                dob = TO_DATE('${val.DOB}', 'YYYY-MM-DD')`
                result = await connection.execute(sql, binds2, options);
                await connection.commit()

                if (result.rowsAffected > 0) {
                    return { status: true, message: "Password is updated." }
                }
            }
        }

        sql = `SELECT * FROM empma WHERE idcardno = '${val.IDCARDNO}' AND dob = TO_DATE('${val.DOB}', 'YYYY-MM-DD')`
        binds2 = {};
        // console.log(sql, "sql")
        let result5 = await connection.execute(sql, binds2, options)

        // sql = `SELECT * FROM empma WHERE idcardno = '${val.IDCARDNO}' AND dob = TO_DATE('${val.DOB}', 'YYYY-MM-DD')`
        // binds2 = {};
        // console.log(sql, "sql")
        // let result6 = await connection.execute(sql, binds2, options)

        if (result5.rows.length === 0) {
            return { status: false, message: "The Date of Birth and ID Card Number do not match for the same user" }
        } else {
            let sql2 = `select DEVICETOKEN from  userdevice where deviceid = '${val.DEVICEID}'`;
            binds2 = {};
            let result3 = await connection.execute(sql2, binds2, options);

            if (result3.rows.length === 0) {
                return { status: false, message: "No valid device token found" }
            }
            // console.log(result5.rows[0].DOJ)
            const dojDate = moment(result5.rows[0].DOJ).format("YYYY-MM-DD");

            sql = `INSERT INTO MOBILE_APP_USERS (USERNAME,PASSWORD,IDCARDNO,EMPMAID,MOBILENO,DEVICEID,EMPNAME,DOB,IMAGEPATH,IMAGEAPP,
              APPROVAL,CREATEDON,DEVICETOKEN,TYPE,DOJ) VALUES('${val.USERNAME}','${val.PASSWORD}','${val.IDCARDNO}','${result5.rows[0].EMPMAID}',
              ${result5.rows[0].PANNO},'${val.DEVICEID}','${result5.rows[0].EMPNAME}', TO_DATE('${val.DOB}', 'YYYY-MM-DD'),null,null,
             'T',SYSDATE,'${result3.rows[0].DEVICETOKEN}','${val.TYPE}',TO_DATE('${dojDate}', 'YYYY-MM-DD'))`

            //console.log(sql)

            connection = await oracle.getConnection(dbconfig)
            binds2 = {}
            options = {
                outFormat: oracle.OUT_FORMAT_OBJECT
            }
            result = await connection.execute(sql, binds2, options)
            await connection.commit()

            // console.log(result.rowsAffected);

            if (result.rowsAffected > 0) {
                resultObj1 = { status: true, message: "Registration successful.", values: result.rows }
            } else {
                resultObj1 = { status: false, message: "Registration unsuccessful." }
            }
            return resultObj1
        }
    } catch (e) {
        console.log("ResigistinsertData", e.message);
        return resultObj1 = { status: false, message: "Registration unsuccessful." }
    } finally {
        try {
            if (connection) {
                await connection.close()

            }
        } catch (e) {
            console.log("Error ResigistinsertData", e.message);
        }
    }
};



async function mleavemasdetData(val, leaveDetails, messaging) {
    let connection, sql, binds2, options, result1, resultObj1, result2, result, result3;
    try {
        connection = await oracle.getConnection(dbconfig);
        sql = `select lstatus,ldate from mleavedet where empid = '${val.idcardno}' and 
            ldate = TO_DATE('${val.leaveDetails[0].date}', 'DD-MM-YYYY')`
        binds2 = {};
        options = { outFormat: oracle.OUT_FORMAT_OBJECT };
        result1 = await connection.execute(sql, binds2, options);

        sql = `select lstatus,ldate from mleavedet where empid = '${val.idcardno}' and 
            ldate = TO_DATE('${val.leaveDetails[val.leaveDetails.length - 1].date}', 'DD-MM-YYYY')`
        binds2 = {};
        options = { outFormat: oracle.OUT_FORMAT_OBJECT };
        result2 = await connection.execute(sql, binds2, options);

        if (val.leaveDetails[0].status === "Second Half" || val.leaveDetails[val.leaveDetails.length - 1].status === "First Half") {
            if (result1.rows.length > 0 && (result1.rows[0].LSTATUS === val.leaveDetails[0].status || result1.rows[0].LSTATUS === "Whole Day")) {
                return { valid: false, message: `This date has already been applied ${result1.rows[0].LSTATUS}.` };

            } else {

                if (result2.rows.length > 0 && (result2.rows[0].LSTATUS === val.leaveDetails[val.leaveDetails.length - 1].status || result2.rows[0].LSTATUS === "Whole Day")) {
                    return { valid: false, message: `This date has already been applied ${result2.rows[0].LSTATUS}.` };


                } else {
                    sql = `INSERT INTO MLEAVEMAS (DOCDATE, FROMDT, TODT, TOTDAYS, PAYPERIOD, IDCARDNO, TORLEVDAYS, PURPOSE, APPROVE,
                             REJECT, TOTEL, ATAKEN, BALEL, SECESSION) 
                                   VALUES (TO_DATE('${val.docdate}', 'YYYY-MM-DD'), TO_DATE('${val.fromdt}', 'YYYY-MM-DD'), TO_DATE('${val.todt}', 'YYYY-MM-DD'), 
                                   ${val.totdays}, '${val.payperiod}', '${val.idcardno}', ${val.torledays}, '${val.purpose}', '${val.approve}', 
                                  '${val.reject}', ${val.totel}, ${val.ataken}, ${val.balel}, 
                                  '${val.leaveDetails[0].status},${val.leaveDetails[val.leaveDetails.length - 1].status}')`;
                    binds2 = {};
                    options = { outFormat: oracle.OUT_FORMAT_OBJECT };
                    result3 = await connection.execute(sql, binds2, options);
                    await connection.commit();

                    if (result3.rowsAffected > 0) {
                        for (let i = 0; i < val.leaveDetails.length; i++) {
                            const detail = val.leaveDetails[i];
                            let days = detail.status === 'Whole Day' ? 1 : 0.5;
                            sql = `INSERT INTO MLEAVEDET (EMPID, LDATE, LSTATUS, LDAYS, ELTYPE)
                                               VALUES ('${val.idcardno}', TO_DATE('${detail.date}', 'DD/MM/YYYY'), '${detail.status}', 
                                                       ${days}, '${detail.type}')`;

                            result = await connection.execute(sql, binds2, options);
                            await connection.commit();
                        }
                    }
                }
            }
        } else {
            if (result1.rows.length > 0 || result2.rows.length > 0) {
                return { valid: false, message: `This date has already been applied.` };
            } else {
                sql = `INSERT INTO MLEAVEMAS (DOCDATE, FROMDT, TODT, TOTDAYS, PAYPERIOD, IDCARDNO, TORLEVDAYS, PURPOSE, APPROVE,
                REJECT, TOTEL, ATAKEN, BALEL, SECESSION) 
                      VALUES (TO_DATE('${val.docdate}', 'YYYY-MM-DD'), TO_DATE('${val.fromdt}', 'YYYY-MM-DD'), TO_DATE('${val.todt}', 'YYYY-MM-DD'), 
                      ${val.totdays}, '${val.payperiod}', '${val.idcardno}', ${val.torledays}, '${val.purpose}', '${val.approve}', 
                     '${val.reject}', ${val.totel}, ${val.ataken}, ${val.balel}, 
                     '${val.leaveDetails[0].status},${val.leaveDetails[val.leaveDetails.length - 1].status}')`;
                binds2 = {};
                options = { outFormat: oracle.OUT_FORMAT_OBJECT };
                result3 = await connection.execute(sql, binds2, options);
                await connection.commit();

                if (result3.rowsAffected > 0) {

                    for (let i = 0; i < val.leaveDetails.length; i++) {
                        const detail = val.leaveDetails[i];
                        let days = detail.status === 'Whole Day' ? 1 : 0.5;
                        sql = `INSERT INTO MLEAVEDET (EMPID, LDATE, LSTATUS, LDAYS, ELTYPE)
                                           VALUES ('${val.idcardno}', TO_DATE('${detail.date}', 'DD/MM/YYYY'), '${detail.status}', 
                                                   ${days}, '${detail.type}')`;

                        result = await connection.execute(sql, binds2, options);
                        await connection.commit();
                    }
                }

            }

        }
        if (result3.rowsAffected > 0) {

            sql = `SELECT UNDERHEADEMPID FROM EMPMA WHERE EMPID = '${val.idcardno}'`;
            let getUnderHead = await connection.execute(sql, binds2, options);

            sql = `select devicetoken from MOBILE_APP_USERS where idcardno='${getUnderHead.rows[0].UNDERHEADEMPID}'`
            binds2 = {};
            // console.log(sql,"sql1")
            options = { outFormat: oracle.OUT_FORMAT_OBJECT };
            let token = await connection.execute(sql, binds2, options);

            if (getUnderHead.rows.length > 0) {
                sql = `SELECT C.DEVICETOKEN, C.DEVICEID, C.IDCARDNO FROM MLEAVEMAS A, EMPMA B, MOBILE_APP_USERS C WHERE A.IDCARDNO = B.IDCARDNO 
                         AND B.UNDERHEADEMPID = ${getUnderHead.rows[0].UNDERHEADEMPID} AND A.APPROVE = 'N' AND A.REJECT = 'N' 
                         AND C.IDCARDNO = ${getUnderHead.rows[0].UNDERHEADEMPID}`;
                let getToken = await connection.execute(sql, binds2, options);

                sql = `select C.DEVICETOKEN from MPERMAS a, EMPMA b, MOBILE_APP_USERS C where 
                A.IDCARDNO = B.IDCARDNO and B.UNDERHEADEMPID =${getUnderHead.rows[0].UNDERHEADEMPID} and a.APPROVE='N' 
                and a.REJECT='N' and C.IDCARDNO=${getUnderHead.rows[0].UNDERHEADEMPID}`

                let getToken2 = await connection.execute(sql, binds2, options)

                sql = `select C.DEVICETOKEN  from MONDUTYMAS a, EMPMA b,MOBILE_APP_USERS C where 
                A.IDCARDNO = B.IDCARDNO and B.UNDERHEADEMPID =${getUnderHead.rows[0].UNDERHEADEMPID} and a.APPROVE='N' 
                and a.REJECT='N' and C.IDCARDNO=${getUnderHead.rows[0].UNDERHEADEMPID}`

                let getToken3 = await connection.execute(sql, binds2, options);
                if (token.rows[0].DEVICETOKEN !== null) {

                    const receivedToken = token.rows[0].DEVICETOKEN;
                    const message = {
                        notification: {
                            title: "Leave Request",
                            body: `${getToken.rows.length} leave requests pending,\n${getToken2.rows.length} Permission requests pending,\n${getToken3.rows.length} Onduty requests pending`
                        },
                        token: receivedToken,
                    };
                    try {
                        const response = await messaging.send(message);
                        console.log("Successfully sent message:", response);


                        sql = `SELECT * FROM notification where hodid=  ${getUnderHead.rows[0].UNDERHEADEMPID} and
                           staff_id =${val.idcardno}`
                        let resultIn = await connection.execute(sql, binds2, options);

                        if (resultIn.rows.length === 0) {
                            sql = `INSERT INTO notification (status, HODID, staff_id, created_at)
                        VALUES ('Successfully', ${getUnderHead.rows[0].UNDERHEADEMPID}, ${val.idcardno}, CURRENT_TIMESTAMP)`
                            result = await connection.execute(sql, binds2, options);
                            await connection.commit()
                        } else {
                            sql = `UPDATE notification SET status = 'Successfully', created_at = CURRENT_TIMESTAMP
                             WHERE  HODID = ${getUnderHead.rows[0].UNDERHEADEMPID} and staff_id = ${val.idcardno}`
                            result = await connection.execute(sql, binds2, options);
                            await connection.commit()
                        }

                    } catch (error) {
                        console.log("Error sending message:", error);

                        sql = `SELECT * FROM notification where hodid=  ${getUnderHead.rows[0].UNDERHEADEMPID} and
                        staff_id =${val.idcardno}`

                        let resultIn = await connection.execute(sql, binds2, options);

                        if (resultIn.rows.length === 0) {
                            sql = `INSERT INTO notification (status, HODID, staff_id,created_at)
                        VALUES ('Failed', ${getUnderHead.rows[0].UNDERHEADEMPID}, ${val.idcardno}, CURRENT_TIMESTAMP)`;
                            result = await connection.execute(sql, binds2, options);
                            await connection.commit();
                        }
                        else {
                            sql = `UPDATE notification SET status = 'Failed', created_at = CURRENT_TIMESTAMP
                             WHERE  HODID = ${getUnderHead.rows[0].UNDERHEADEMPID} and staff_id = ${val.idcardno}`
                            result = await connection.execute(sql, binds2, options);
                            await connection.commit()
                        }
                    };
                } else {
                    resultObj1 = { valid: true };

                }
                resultObj1 = { valid: true };

            }
        } else {
            resultObj1 = { valid: false };
        }

        return resultObj1;
    } catch (e) {
        console.log("mleavemasdetData error:", e.message);
        return { valid: false };
    } finally {
        try {
            if (connection) {
                await connection.close();
            }
        } catch (e) {
            console.log("Error closing connection:", e.message);
        }

    }
}

async function leavelogin(value) {

    let sql, binds, connection, options, result, result2, devicecount, deviceId, updatedevice, result3, result4;
    // Convert the MD5 hash
    const hashedPassword = crypto.createHash('md5').update(value.password).digest('hex');
    try {
        console.log(value, "val")

        connection = await oracle.getConnection(dbconfig);

        // Get the device ID for the given ID card number
        sql = `SELECT DEVICEID FROM MOBILE_APP_USERS WHERE IDCARDNO = ${value.idcardno}`;
        binds = {};
        options = { outFormat: oracle.OUT_FORMAT_OBJECT };
        deviceId = await connection.execute(sql, binds, options);



        if (deviceId.rows[0].DEVICEID === null) {

            // deviceID matches another user's deviceID
            sql = `SELECT COUNT(DISTINCT DEVICEID) AS DEVICEIDCOUNT FROM MOBILE_APP_USERS
                   WHERE DEVICEID = '${value.deviceId}'`;
            binds = {};
            options = { outFormat: oracle.OUT_FORMAT_OBJECT };
            devicecount = await connection.execute(sql, binds, options);

            if (devicecount.rows[0].DEVICEIDCOUNT > 0) {
                return { status: false, message: "Your deviceID matches another user's deviceID" };
            }
        }


        // If device ID is null, update it with the new device ID
        if (deviceId.rows[0].DEVICEID === null) {
            sql = `UPDATE MOBILE_APP_USERS SET DEVICEID = '${value.deviceId}' WHERE IDCARDNO = ${value.idcardno}`;
            binds = {};
            options = { outFormat: oracle.OUT_FORMAT_OBJECT };
            updatedevice = await connection.execute(sql, binds, options);
            await connection.commit();
        }

        // Check if the user is approved
        sql = `SELECT APPROVAL FROM MOBILE_APP_USERS 
               WHERE IDCARDNO = ${value.idcardno}`;
        binds = {};
        options = { outFormat: oracle.OUT_FORMAT_OBJECT };
        approval = await connection.execute(sql, binds, options);

        if (approval.rows[0].APPROVAL !== "T") {
            return { status: false, message: "Your userID was not approved." };
        }

        // Check if the device ID matches the registered one
        sql = `SELECT USERNAME FROM MOBILE_APP_USERS 
               WHERE IDCARDNO = ${value.idcardno} AND DEVICEID = '${value.deviceId}'`;
        binds = {};
        options = { outFormat: oracle.OUT_FORMAT_OBJECT };
        result = await connection.execute(sql, binds, options);
        //     console.log(result, sql)
        if (result.rows.length === 0) {
            return { status: false, message: "Not a valid device. Please login with your registered device.", Empname: null };
        }



        // Check if the ID card number and password match
        sql = `SELECT USERNAME FROM MOBILE_APP_USERS 
               WHERE IDCARDNO = ${value.idcardno} AND UPPER(PASSWORD) = UPPER('${value.password}')`;

        //    sql = `SELECT USERNAME FROM MOBILE_APP_USERS 
        //    WHERE IDCARDNO = ${value.idcardno} AND UPPER(PASSWORD) = UPPER('${hashedPassword}')`;
        binds = {};
        result2 = await connection.execute(sql, binds, options);

        if (result2.rows.length === 0) {
            return { status: false, message: "Please check username or password.", Empname: null };
        }

        sql = `select DEVICETOKEN from  userdevice where deviceid = '${value.deviceId}' `;
        binds = {};
        result3 = await connection.execute(sql, binds, options);

        if (result3.rows.length > 0) {
            const updateSql = `UPDATE MOBILE_APP_USERS SET DEVICETOKEN = '${result3.rows[0].DEVICETOKEN}'
                               WHERE IDCARDNO = ${value.idcardno} AND DEVICEID = '${value.deviceId}'`;
            result4 = await connection.execute(updateSql);
            await connection.commit();

            if (result4.rowsAffected === 0) {
                return { status: false, message: "Device token is not stored" };
            }
        }

        // Return success message and username
        return { status: true, message: "Login successful", Empname: result2.rows[0].USERNAME };
    } catch (e) {
        return { message: "Error", error: e.message };
    } finally {

        if (connection) {
            try {
                await connection.close();
            } catch (e) {
                console.log("leavelogin connection:", e.message);
            }
        }
    }
}




async function mpermissionmasData(val, messaging) {
    let connection, sql, binds2, options, result, resultObj
    try {

        sql = ` INSERT INTO MPERMAS (IDCARDNO, PDATE, FROMTIME, TOTIME, TOHRS, APPROVE, REASON, PAYPERIOD, REJECT, TOTHRS) 
        VALUES ('${val.idcardno}', TO_DATE('${val.pDate}', 'YYYY-MM-DD'), TO_DATE('${val.fromTime}', 'HH24:MI:SS'), 
        TO_DATE('${val.toTime}', 'HH24:MI:SS'),'${val.toHrs}', 'N', '${val.reason}', 
        '${val.payPeriod}', 'N', '${val.toHrs}')`

        connection = await oracle.getConnection(dbconfig)
        binds2 = {}
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        }
        result = await connection.execute(sql, binds2, options)
        await connection.commit()
        if (result.rowsAffected > 0) {

            sql = `select UNDERHEADEMPID from empma where EMPID='${val.idcardno}'`
            let getUnderHead = await connection.execute(sql, binds2, options);

            sql = `select devicetoken from MOBILE_APP_USERS where idcardno='${getUnderHead.rows[0].UNDERHEADEMPID}'`
            binds2 = {};
            //console.log(sql,"sql1")
            options = { outFormat: oracle.OUT_FORMAT_OBJECT };
            let token = await connection.execute(sql, binds2, options);

            if (getUnderHead.rows.length > 0) {

                sql = `SELECT C.DEVICETOKEN  FROM MLEAVEMAS A, EMPMA B, MOBILE_APP_USERS C WHERE A.IDCARDNO = B.IDCARDNO 
                AND B.UNDERHEADEMPID = ${getUnderHead.rows[0].UNDERHEADEMPID} AND A.APPROVE = 'N' AND A.REJECT = 'N' 
                AND C.IDCARDNO = ${getUnderHead.rows[0].UNDERHEADEMPID}`;
                let getToken = await connection.execute(sql, binds2, options);

                sql = `select C.DEVICETOKEN from MPERMAS a, EMPMA b, MOBILE_APP_USERS C where 
                A.IDCARDNO = B.IDCARDNO and B.UNDERHEADEMPID =${getUnderHead.rows[0].UNDERHEADEMPID} and a.APPROVE='N' 
                and a.REJECT='N' and C.IDCARDNO=${getUnderHead.rows[0].UNDERHEADEMPID}`

                let getToken2 = await connection.execute(sql, binds2, options)

                sql = `select C.DEVICETOKEN  from MONDUTYMAS a, EMPMA b,MOBILE_APP_USERS C where 
                A.IDCARDNO = B.IDCARDNO and B.UNDERHEADEMPID =${getUnderHead.rows[0].UNDERHEADEMPID} and a.APPROVE='N' 
                and a.REJECT='N' and C.IDCARDNO=${getUnderHead.rows[0].UNDERHEADEMPID}`

                let getToken3 = await connection.execute(sql, binds2, options);

                if (token.rows[0].DEVICETOKEN !== null) {

                    const receivedToken = token.rows[0].DEVICETOKEN
                    const message = {
                        notification: {
                            title: "Permission Request",
                            body: `${getToken.rows.length} leave requests pending,\n${getToken2.rows.length} Permission requests pending,\n${getToken3.rows.length} Onduty requests pending`
                        },
                        token: receivedToken,
                    };
                    try {
                        const response = await messaging.send(message);
                        console.log("Successfully sent message:", response);

                        sql = `SELECT * FROM notification where hodid=  ${getUnderHead.rows[0].UNDERHEADEMPID} and
                     staff_id =${val.idcardno}`

                        let resultIn = await connection.execute(sql, binds2, options);

                        if (resultIn.rows.length === 0) {

                            sql = `INSERT INTO notification (status, HODID, staff_id, created_at)
                    VALUES ('Successfully', ${getUnderHead.rows[0].UNDERHEADEMPID}, ${val.idcardno}, CURRENT_TIMESTAMP)`
                            result = await connection.execute(sql, binds2, options);
                            await connection.commit()
                        } else {
                            sql = `UPDATE notification SET status = 'Successfully', created_at = CURRENT_TIMESTAMP
                         WHERE  HODID = ${getUnderHead.rows[0].UNDERHEADEMPID} and staff_id = ${val.idcardno}`
                            result = await connection.execute(sql, binds2, options);
                            await connection.commit()
                        }

                    } catch (error) {
                        console.log("Error sending message:", error);

                        sql = `SELECT * FROM notification where hodid=  ${getUnderHead.rows[0].UNDERHEADEMPID} and
                    staff_id =${val.idcardno}`

                        let resultIn = await connection.execute(sql, binds2, options);

                        if (resultIn.rows.length === 0) {
                            sql = `INSERT INTO notification (status, HODID, staff_id,created_at)
                    VALUES ('Failed', ${getUnderHead.rows[0].UNDERHEADEMPID}, ${val.idcardno}, CURRENT_TIMESTAMP)`;
                            result = await connection.execute(sql, binds2, options);
                            await connection.commit();
                        }
                        else {
                            sql = `UPDATE notification SET status = 'Failed', created_at = CURRENT_TIMESTAMP
                         WHERE  HODID = ${getUnderHead.rows[0].UNDERHEADEMPID} and staff_id = ${val.idcardno}`
                            result = await connection.execute(sql, binds2, options);
                            await connection.commit()
                        }
                    };
                } else {
                    resultObj = { valid: true }
                }
                resultObj = { valid: true, values: result.rows }
            }

        } else {
            resultObj = { valid: false }
        }
        return resultObj
    } catch (e) {
        console.log("mpermissionmasData", e.message);
        return resultObj = { valid: false }
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("Error mpermissionmasData", e.message);
        }
    }
};

// async function OndutyDetailsData(val) {
//     let connection, sql, binds2, options, result, resultObj
//     try {
//         sql = `INSERT INTO MONDUTYMAS (IDCARDNO, PDATE, FROMTIME, TOTIME, TOHRS, APPROVE, REASON, PAYPERIOD, ONDUTYLOCATION, REJECT, TOTHRS) 
//         VALUES ('IDCARDNO:idCardNo', PDATE:pDate, FROMTIME:fromTime, TOTIME:toTime, TOHRS:toHrs, 'APPROVE:approve', 'REASON:reason', 'PAYPERIOD:payPeriod', 'ONDUTYLOCATION:onDutyLocation', 'REJECT:reject', 'TOTHRS:toThrs')`
//         connection = await oracle.getConnection(dbconfig)
//         binds2 = {}
//         options = {
//             outFormat: oracle.OUT_FORMAT_OBJECT
//         }
//         result = await connection.execute(sql, binds2, options)
//         await connection.commit()
//         if (result.rowsAffected > 0) {
//             sql = `select UNDERHEADEMPID from empma where EMPID='${val.idcardno}'`
//             let getUnderHead = await connection.execute(sql, binds2, options);
//             if (getUnderHead.rows.length > 0) {

//                 sql = `SELECT C.DEVICETOKEN  FROM MLEAVEMAS A, EMPMA B, MOBILE_APP_USERS C WHERE A.IDCARDNO = B.IDCARDNO 
//                 AND B.UNDERHEADEMPID = ${getUnderHead.rows[0].UNDERHEADEMPID} AND A.APPROVE = 'N' AND A.REJECT = 'N' 
//                 AND C.IDCARDNO = ${getUnderHead.rows[0].UNDERHEADEMPID}`;
//                 let getToken = await connection.execute(sql, binds2, options);

//                 sql = `select C.DEVICETOKEN from MPERMAS a, EMPMA b, MOBILE_APP_USERS C where 
//                 A.IDCARDNO = B.IDCARDNO and B.UNDERHEADEMPID =${getUnderHead.rows[0].UNDERHEADEMPID} and a.APPROVE='N' 
//                 and a.REJECT='N' and C.IDCARDNO=${getUnderHead.rows[0].UNDERHEADEMPID}`

//                 let getToken2 = await connection.execute(sql, binds2, options)

//                 sql = `select C.DEVICETOKEN  from MONDUTYMAS a, EMPMA b,MOBILE_APP_USERS C where 
//                 A.IDCARDNO = B.IDCARDNO and B.UNDERHEADEMPID =${getUnderHead.rows[0].UNDERHEADEMPID} and a.APPROVE='N' 
//                 and a.REJECT='N' and C.IDCARDNO=${getUnderHead.rows[0].UNDERHEADEMPID}`

//                 let getToken3 = await connection.execute(sql, binds2, options);
//                 const receivedToken = getToken.rows[0].DEVICETOKEN
//                 const message = {
//                     notification: {
//                         title: "Onduty Request",
//                         body: `${getToken.rows.length} leave requests pending,\n${getToken2.rows.length} Permission requests pending,\n${getToken3.rows.length} Onduty requests pending`
//                     },
//                     token: receivedToken,

//                 };
//                 try {
//                     const response = await messaging.send(message);
//                     console.log("Successfully sent message:", response);

//                     console.log("check 3")
//                     sql = `SELECT * FROM notification where hodid=  ${getUnderHead.rows[0].UNDERHEADEMPID} and
//                      staff_id =${val.idcardno}`

//                     let resultIn = await connection.execute(sql, binds2, options);

//                     if (resultIn.rows.length === 0) {

//                         sql = `INSERT INTO notification (status, HODID, staff_id, created_at)
//                     VALUES ('Successfully', ${getUnderHead.rows[0].UNDERHEADEMPID}, ${val.idcardno}, CURRENT_TIMESTAMP)`
//                         result = await connection.execute(sql, binds2, options);
//                         await connection.commit()
//                     } else {
//                         sql = `UPDATE notification SET status = 'Successfully', created_at = CURRENT_TIMESTAMP
//                          WHERE  HODID = ${getUnderHead.rows[0].UNDERHEADEMPID} and staff_id = ${val.idcardno}`
//                         result = await connection.execute(sql, binds2, options);
//                         await connection.commit()
//                     }

//                 } catch (error) {
//                     console.log("Error sending message:", error);

//                     sql = `SELECT * FROM notification where hodid=  ${getUnderHead.rows[0].UNDERHEADEMPID} and
//                     staff_id =${val.idcardno}`

//                     let resultIn = await connection.execute(sql, binds2, options);

//                     if (resultIn.rows.length === 0) {
//                         sql = `INSERT INTO notification (status, HODID, staff_id,created_at)
//                     VALUES ('Failed', ${getUnderHead.rows[0].UNDERHEADEMPID}, ${val.idcardno}, CURRENT_TIMESTAMP)`;
//                         result = await connection.execute(sql, binds2, options);
//                         await connection.commit();
//                     }
//                     else {
//                         sql = `UPDATE notification SET status = 'Failed', created_at = CURRENT_TIMESTAMP
//                          WHERE  HODID = ${getUnderHead.rows[0].UNDERHEADEMPID} and staff_id = ${val.idcardno}`
//                         result = await connection.execute(sql, binds2, options);
//                         await connection.commit()
//                     }
//                 };
//             }
//             resultObj = { valid: true, values: result.rows }
//         } else {
//             resultObj = { valid: false }
//         }
//         return resultObj
//     } catch (e) {
//         console.log("OndutyDetailsData", e.message);
//         return resultObj = { valid: false }
//     } finally {
//         try {
//             if (connection) {
//                 await connection.close()
//             }
//         } catch (e) {
//             console.log("OndutyDetailsData Error", e.message);
//         }
//     }
// };


async function OpeldaysData(val) {
    let connection, sql, binds2, options, result, resultObj
    try {
        sql = `select opeldays from stfopmas a,stfopdet b where 
        A.STFOPMASID=B.STFOPMASID 
        and finyr = TO_CHAR(TO_DATE('${val.docdate}', 'DD-MM-YYYY'), 'YYYY')  and empid='${val.idcardno}' `

        connection = await oracle.getConnection(dbconfig)
        binds2 = {}
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        }
        result = await connection.execute(sql, binds2, options)
        await connection.commit()

        return { response: result.rows, message: "success" }
    } catch (e) {
        console.log("OpeldaysData", e.message);
        return resultObj = { valid: false }
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("Error OpeldaysData", e.message);
        }
    }
};

async function ApprovalData(val) {
    let connection, sql, binds2, options, result, resultObj
    try {

        // sql=`select UNDERHEADEMPID from empma where idcardno=${val.loginid}`

        connection = await oracle.getConnection(dbconfig)
        binds2 = {}
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        }
        // result = await connection.execute(sql, binds2, options)

        sql = `select a.*,B.EMPNAME, B.DEPTNAME from mleavemas a, EMPMA b where 
        A.IDCARDNO = B.IDCARDNO and B.UNDERHEADEMPID =${val.loginid} and a.APPROVE='N' 
        and a.REJECT='N'`


        result = await connection.execute(sql, binds2, options)
        // await connection.commit()

        if (result.rows.length > 0) {

            return { response: result.rows, message: true }
        } else {
            return { message: false }
        }
    } catch (e) {
        console.log("MobDetails ApprovalData Err1", e.message);
        return resultObj = { message: false }
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("MobDetails ApprovalData Err2", e.message);
        }
    }
};

async function Employeedetails(val) {
    let connection, sql, binds2, options, result, resultObj
    try {
        sql = `select idcardno,empname,panno,dob,doj,UNDERHEADEMPID from empma where type = '${val.staf}'`

        connection = await oracle.getConnection(dbconfig)
        binds2 = {}
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        }
        result = await connection.execute(sql, binds2, options)
        await connection.commit()

        return { response: result.rows, message: "success" }
    } catch (e) {
        console.log("Employeedetails ", e.message);
        return resultObj = { valid: false }
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("Error Employeedetails", e.message);
        }
    }
};

async function shiftDetails(val) {
    let connection, sql, binds2, options, result, resultObj
    try {
        sql = `select idcardno,indate,intime,outdate,outtime,shiftcnt from hdattaall where type = '${val.staf}'`

        connection = await oracle.getConnection(dbconfig)
        binds2 = {}
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        }
        result = await connection.execute(sql, binds2, options)
        await connection.commit()

        return { response: result.rows, message: "success" }
    } catch (e) {
        console.log("shiftDetails", e.message);
        return resultObj = { valid: false }
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("Error shiftDetails", e.message);
        }
    }
};


async function updateLeaveApproval(val) {
    let connection, sql, binds2, options, result, resultObj
    try {
        connection = await oracle.getConnection(dbconfig)
        for (let i = 0; i < val.length; i++) {
            sql = `UPDATE MLEAVEMAS SET APPROVE='${val[i].APPR}' , REJECT='${val[i].REJ}' WHERE IDCARDNO='${val[i].IDCARDNO}' 
            AND FROMDT = TO_DATE('${val[i].FROMDT}', 'DD/MM/YYYY') AND TODT= TO_DATE('${val[i].TODT}', 'DD/MM/YYYY')`

            binds2 = {}
            options = {
                outFormat: oracle.OUT_FORMAT_OBJECT
            }
            result = await connection.execute(sql, binds2, options)

            await connection.commit()
        }
        if (result.rowsAffected > 0) {
            return { response: result.rows, message: "success" }
        } else {
            return { response: result.rows, message: "failure" }
        }
    } catch (e) {
        console.log("updateLeaveApproval", e.message);
        return resultObj = { message: false }
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("Error updateLeaveApproval", e.message);
        }
    }
};

async function leaverequestshow(loginid) {
    let sql, result, binds, connection, option, result2, result4, result3;
    try {
        connection = await oracle.getConnection(dbconfig);

        sql = `SELECT FROMDT, TODT, APPROVE, REJECT, 
            CASE 
                WHEN APPROVE = 'Y' AND REJECT = 'N' THEN 'Approved'
                WHEN APPROVE = 'N' AND REJECT = 'Y' THEN 'Rejected'
                ELSE 'Pending'
            END AS STATUS,PURPOSE,TOTDAYS
        FROM MLEAVEMAS
        WHERE IDCARDNO = '${loginid}'`;
        binds = {};
        option = { outFormat: oracle.OUT_FORMAT_OBJECT };
        result = await connection.execute(sql, binds, option);

        sql = `SELECT * FROM stfopdet WHERE empid = '${loginid}'`;
        result4 = await connection.execute(sql, binds, option);

        if (result4.rows.length > 0) {
            sql = `SELECT NVL(opeldays, 0) EL FROM stfopmas a, stfopdet b 
                   WHERE A.STFOPMASID = B.STFOPMASID 
                   AND finyr = TO_CHAR(SYSDATE, 'YYYY')
                   AND empid = '${loginid}'`;

            result2 = await connection.execute(sql, binds, option);
        } else {
            result2 = { rows: [{ EL: 0 }] }; // Initialize result2 with default value
        }

        sql = `SELECT NVL(SUM(ldays), 0) AT FROM payroll.stfleavemas a, payroll.stfleavedet b 
               WHERE A.STFLEAVEMASID = b.STFLEAVEMASID 
               AND lyear = TO_CHAR(SYSDATE, 'yyyy') 
               AND empid = '${loginid}' 
               AND type = 'EL'`;
        result3 = await connection.execute(sql, binds, option);

        // console.log(result2.rows[0].EL);
        // console.log(result3.rows[0].AT);
        // console.log(result.rows)

        return {
            message: "success",
            EL: result2.rows[0].EL,
            AT: result3.rows[0].AT,
            response: result.rows
        };
    } catch (e) {
        console.log("leaverequestshow", e.message);
        return { message: "Error", error: e.message };
    } finally {
        try {
            if (connection) {
                await connection.close();
            }
        } catch (e) {
            console.log("leaverequestshow connection", e.message);
        }
    }
}


async function getpermission(loginid) {
    let sql, result, binds, connection, option, result2, result4, result3;
    try {
        connection = await oracle.getConnection(dbconfig);

        sql = `SELECT FROMTIME, TOTIME, APPROVE, REJECT,CASE 
                WHEN APPROVE = 'Y' AND REJECT = 'N' THEN 'Approved'
                WHEN APPROVE = 'N' AND REJECT = 'Y' THEN 'Rejected'
                ELSE 'Pending'
            END AS STATUS,REASON,TOTHRS
        FROM MPERMAS
        WHERE IDCARDNO = '${loginid}'`;
        binds = {};
        option = { outFormat: oracle.OUT_FORMAT_OBJECT };
        result = await connection.execute(sql, binds, option);


        return {
            message: "success",
            response: result.rows
        };
    } catch (e) {
        console.log("getpermission", e.message);
        return { message: "Error", error: e.message };
    } finally {
        try {
            if (connection) {
                await connection.close();
            }
        } catch (e) {
            console.log("getpermission connection", e.message);
        }
    }
}


async function insertonduty(val, messaging) {
    let sql, result, binds, connection, options, option, resultObj, binds2;
    try {
        connection = await oracle.getConnection(dbconfig);

        let from = `${val.fromTime}`;
        let fromTime = moment(from).format('YYYY-MM-DD HH:mm:ss');

        let to = `${val.toTime}`;
        let toTime = moment(to).format('YYYY-MM-DD HH:mm:ss');

        let dateString = `${val.fromDate}`;
        let fromDate = moment(dateString).format('YYYY-MM-DD');

        sql = `select UNDERHEADEMPID from empma where EMPID='${val.idcardno}'`
        binds2 = {};
        // console.log(sql,"sql")
        options = { outFormat: oracle.OUT_FORMAT_OBJECT };
        let getUnderHead1 = await connection.execute(sql, binds2, options);


        sql = `select devicetoken from MOBILE_APP_USERS where idcardno='${getUnderHead1.rows[0].UNDERHEADEMPID}'`
        binds2 = {};
        // console.log(sql,"sql1")

        options = { outFormat: oracle.OUT_FORMAT_OBJECT };
        let token = await connection.execute(sql, binds2, options);



        sql = `INSERT INTO MONDUTYMAS ( IDCARDNO,PDATE,FROMTIME,TOTIME,APPROVE,REASON,PAYPERIOD,ONDUTYLOCATION,REJECT,TOTHRS,TYPE,TOHRS)
        VALUES ( '${val.idcardno}', TO_DATE('${fromDate}', 'YYYY-MM-DD'), TO_DATE('${fromTime}', 'YYYY-MM-DD HH24:MI:SS'),
        TO_DATE('${toTime}', 'YYYY-MM-DD HH24:MI:SS'), 'N','${val.reason}','${val.payPeriod}', '${val.location}','N', '${val.totHrs}','${val.type}','${val.totHrs}')`;

        //  console.log(sql,"sql2")

        binds2 = {};
        options = { outFormat: oracle.OUT_FORMAT_OBJECT };
        result = await connection.execute(sql, binds2, options);
        await connection.commit()

        if (result.rowsAffected > 0) {
            // console.log("check")

            sql = `select UNDERHEADEMPID from empma where EMPID='${val.idcardno}'`
            let getUnderHead = await connection.execute(sql, binds2, options);

            sql = `select devicetoken from MOBILE_APP_USERS where idcardno='${getUnderHead.rows[0].UNDERHEADEMPID}'`
            binds2 = {};
            //  console.log(sql,"sql1")
            options = { outFormat: oracle.OUT_FORMAT_OBJECT };
            let token = await connection.execute(sql, binds2, options);

            if (getUnderHead.rows.length > 0) {

                sql = `SELECT C.DEVICETOKEN  FROM MLEAVEMAS A, EMPMA B, MOBILE_APP_USERS C WHERE A.IDCARDNO = B.IDCARDNO 
                AND B.UNDERHEADEMPID = ${getUnderHead.rows[0].UNDERHEADEMPID} AND A.APPROVE = 'N' AND A.REJECT = 'N' 
                AND C.IDCARDNO = ${getUnderHead.rows[0].UNDERHEADEMPID}`;
                let getToken = await connection.execute(sql, binds2, options);

                sql = `select C.DEVICETOKEN from MPERMAS a, EMPMA b, MOBILE_APP_USERS C where 
                A.IDCARDNO = B.IDCARDNO and B.UNDERHEADEMPID =${getUnderHead.rows[0].UNDERHEADEMPID} and a.APPROVE='N' 
                and a.REJECT='N' and C.IDCARDNO=${getUnderHead.rows[0].UNDERHEADEMPID}`

                let getToken2 = await connection.execute(sql, binds2, options)

                sql = `select C.DEVICETOKEN  from MONDUTYMAS a, EMPMA b,MOBILE_APP_USERS C where 
                A.IDCARDNO = B.IDCARDNO and B.UNDERHEADEMPID =${getUnderHead.rows[0].UNDERHEADEMPID} and a.APPROVE='N' 
                and a.REJECT='N' and C.IDCARDNO=${getUnderHead.rows[0].UNDERHEADEMPID}`

                let getToken3 = await connection.execute(sql, binds2, options);

                if (token.rows[0].DEVICETOKEN !== null) {
                    const receivedToken = token.rows[0].DEVICETOKEN
                    const message = {
                        notification: {
                            title: "Onduty Request",
                            body: `${getToken.rows.length} leave requests pending,\n${getToken2.rows.length} Permission requests pending,\n${getToken3.rows.length} Onduty requests pending`
                        },
                        token: receivedToken,

                    }

                    try {

                        const response = await messaging.send(message);
                        console.log("Successfully sent message:", response);

                        sql = `SELECT * FROM notification where hodid=  ${getUnderHead.rows[0].UNDERHEADEMPID} and
                     staff_id =${val.idcardno}`

                        let resultIn = await connection.execute(sql, binds2, options);

                        if (resultIn.rows.length === 0) {

                            sql = `INSERT INTO notification (status, HODID, staff_id, created_at)
                    VALUES ('Successfully', ${getUnderHead.rows[0].UNDERHEADEMPID}, ${val.idcardno}, CURRENT_TIMESTAMP)`
                            result = await connection.execute(sql, binds2, options);
                            await connection.commit()
                        } else {
                            sql = `UPDATE notification SET status = 'Successfully', created_at = CURRENT_TIMESTAMP
                         WHERE  HODID = ${getUnderHead.rows[0].UNDERHEADEMPID} and staff_id = ${val.idcardno}`
                            result = await connection.execute(sql, binds2, options);
                            await connection.commit()
                        }
                        //console.log("check")

                    } catch (error) {
                        console.log("Error sending message:", error);

                        sql = `SELECT * FROM notification where hodid=  ${getUnderHead.rows[0].UNDERHEADEMPID} and
                    staff_id =${val.idcardno}`

                        let resultIn = await connection.execute(sql, binds2, options);

                        if (resultIn.rows.length === 0) {
                            sql = `INSERT INTO notification (status, HODID, staff_id,created_at)
                    VALUES ('Failed', ${getUnderHead.rows[0].UNDERHEADEMPID}, ${val.idcardno}, CURRENT_TIMESTAMP)`;
                            result = await connection.execute(sql, binds2, options);
                            await connection.commit();
                        }
                        else {
                            sql = `UPDATE notification SET status = 'Failed', created_at = CURRENT_TIMESTAMP
                         WHERE  HODID = ${getUnderHead.rows[0].UNDERHEADEMPID} and staff_id = ${val.idcardno}`
                            result = await connection.execute(sql, binds2, options);
                            await connection.commit()
                        }
                    };
                } else {
                    resultObj = { valid: true, values: [], message: "The device token is null, successful Onduty" }
                }
                resultObj = { valid: true, values: result.rows, message: "successful Onduty" }
            }


        } else {
            //  console.log("check3")

            resultObj = { valid: false, values: [], message: "Unsuccessful Onduty" }
        }

    } catch (e) {
        console.log("OndutyDetailsData", e.message);
        resultObj = { valid: false, values: [], message: "No valid Devicetoken" }
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("OndutyDetailsData Error", e.message);
        }
        return resultObj
    }
};




async function odpunch(val) {
    let sql, result, binds, connection, option, result2, result4, result3, response1;
    try {
        connection = await oracle.getConnection(dbconfig);

        let dateString = `${val.fromDate}`;
        let fromDate = moment(dateString).format('DD-MM-YYYY');

        sql = `select B.LOCATION, A.ATTDTTIME, B.FLAG, C.* from BSS_ATT_LOG A, bioma1 B, (SELECT * FROM (
        SELECT A.idcardno, A.EMPID, B.compcode, A.odpunch, A.empname FROM empma A, COMPA B WHERE A.H = 'T' AND EMPPREFIX = 'H'
        UNION ALL
        SELECT A.idcardno, A.EMPID, B.compcode, A.odpunch, A.empname FROM empma A, COMPA B WHERE A.U1 = 'T' AND EMPPREFIX = 'U1'
        UNION ALL
        SELECT A.idcardno, A.EMPID, B.compcode, A.odpunch, A.empname FROM empma A, COMPA B WHERE A.U2 = 'T' AND EMPPREFIX = 'U2'
        UNION ALL
        SELECT A.idcardno, A.EMPID, B.compcode, A.odpunch, A.empname FROM empma A, COMPA B WHERE A.U3 = 'T' AND EMPPREFIX = 'U3'
        UNION ALL
        SELECT A.idcardno, A.EMPID, B.compcode, A.odpunch, A.empname FROM empma A, COMPA B WHERE A.U4 = 'T' AND EMPPREFIX = 'U4'
        UNION ALL
        SELECT A.idcardno, A.EMPID, B.compcode, A.odpunch, A.empname FROM empma A, COMPA B WHERE A.COMCODE = B.COMPAID 
        AND A.H = 'F' AND A.U1 = 'F' AND A.U1 = 'F' AND A.U3 = 'F' AND A.U4 = 'F'
        ) WHERE idcardno = '${val.idcardno}')C WHERE A.IP = B.IP AND 
         A.IDCARDNO = C.IDCARDNO ORDER BY TO_DATE(A.ATTDTTIME, 'DD-MM-YYYY HH24:MI:SS') DESC`;

        //console.log(sql,"1223")


        binds = {};
        option = { outFormat: oracle.OUT_FORMAT_OBJECT };
        result = await connection.execute(sql, binds, option);

        let filteredRows = []
        if (result.rows[0].ODPUNCH === 'T') {
            let data = []
            data.push(result.rows[0]);
            filteredRows = data
        }
        //console.log(filteredRows)

        return {
            message: "success",
            response: filteredRows,
            response1: result.rows
        };
    } catch (e) {
        console.log("odpunch", e.message);
        return { message: "Error", error: e.message };
    } finally {
        try {
            if (connection) {
                await connection.close();
            }
        } catch (e) {
            console.log("odpunch connection", e.message);
        }
    }
}

async function Ondutyreq(loginid) {
    let sql, result, binds, connection, option, result2, result4, result3;
    try {
        connection = await oracle.getConnection(dbconfig);

        sql = `SELECT FROMTIME, TOTIME, APPROVE, REJECT, 
            CASE 
                WHEN APPROVE = 'Y' AND REJECT = 'N' THEN 'Approved'
                WHEN APPROVE = 'N' AND REJECT = 'Y' THEN 'Rejected'
                ELSE 'Pending'
            END AS STATUS,REASON,TOTHRS,PDATE
        FROM MONDUTYMAS
        WHERE IDCARDNO = '${loginid}'`;

        binds = {};
        option = { outFormat: oracle.OUT_FORMAT_OBJECT };
        result = await connection.execute(sql, binds, option);


        return {
            message: "success",
            response: result.rows
        };
    } catch (e) {
        console.log("Ondutyreq", e.message);
        return { message: "Error", error: e.message };
    } finally {
        try {
            if (connection) {
                await connection.close();
            }
        } catch (e) {
            console.log("Ondutyreq connection", e.message);
        }
    }
}

async function updateOndutyApproval(val) {
    let connection, sql, binds2, options, result, resultObj
    try {
        for (let i = 0; i < val.length; i++) {
            sql = `UPDATE MONDUTYMAS SET APPROVE='${val[i].APPR}' , REJECT='${val[i].REJ}' WHERE IDCARDNO='${val[i].IDCARDNO}' 
            AND FROMTIME = TO_DATE('${val[i].FROMTIME}', 'DD/MM/YYYY HH24:MI:SS') AND TOTIME= TO_DATE('${val[i].TOTIME}', 'DD/MM/YYYY HH24:MI:SS')`


            connection = await oracle.getConnection(dbconfig)
            binds2 = {}
            options = {
                outFormat: oracle.OUT_FORMAT_OBJECT
            }
            result = await connection.execute(sql, binds2, options)
            await connection.commit()
        }
        if (result.rowsAffected > 0) {
            return { response: result.rows, message: "success" }
        } else {
            return { response: result.rows, message: "failure" }
        }
    } catch (e) {
        console.log("updateOndutyApproval", e.message);
        return resultObj = { message: false }
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("Error updateOndutyApproval", e.message);
        }
    }
};

async function getondutyApprovalData(val) {
    let connection, sql, binds2, options, result, resultObj
    try {
        connection = await oracle.getConnection(dbconfig)
        binds2 = {}
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        }

        sql = `select a.*,B.EMPNAME, B.DEPTNAME from MONDUTYMAS a, EMPMA b where 
        A.IDCARDNO = B.IDCARDNO and B.UNDERHEADEMPID =${val.loginid} and a.APPROVE='N' 
        and a.REJECT='N'  `


        result = await connection.execute(sql, binds2, options)

        if (result.rows.length > 0) {
            return { response: result.rows, message: true }
        } else {
            return { message: false }
        }
    } catch (e) {
        console.log("getondutyApprovalData ", e.message);
        return resultObj = { message: false }
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("Error getondutyApprovalData", e.message);
        }
    }
};




async function getAttendance(val) {
    let connection, sql, binds2, options, result, finalResults = [], sql1, result1;
    try {
        connection = await oracle.getConnection(dbconfig);
        binds2 = {};
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        };

        const startDate = moment(val.sdate);
        const endDate = moment(val.edate);
        const months = [];

        let currentMonth = moment(startDate).startOf('month');
        while (currentMonth.isSameOrBefore(endDate)) {
            const monthStart = currentMonth.clone().startOf('month').format('YYYY-MM-DD');
            const monthEnd = currentMonth.clone().endOf('month').format('YYYY-MM-DD');

            months.push({
                tableSuffix: currentMonth.format('MMYYYY'),
                startDate: monthStart,
                endDate: monthEnd
            });

            currentMonth.add(1, 'month');
        }
        sql1 = `select fromdt from stfleavedet where empid=${val.idCardNo}`

        result1 = await connection.execute(sql1, binds2, options);

        let cnt = 0;
        for (let { tableSuffix, startDate, endDate } of months) {
            const adjustedStartDate = moment(val.sdate).isBefore(startDate) ? startDate : val.sdate;

            const adjustedEndDate = moment(val.edate).isAfter(endDate) ? endDate : val.edate;

            sql = `SELECT A.*, B.* FROM (WITH Date_Range AS (
            SELECT TO_DATE('${adjustedStartDate}', 'YYYY-MM-DD') + LEVEL - 1 AS INDATE
            FROM DUAL CONNECT BY LEVEL <= TO_DATE('${adjustedEndDate}', 'YYYY-MM-DD') - TO_DATE('${adjustedStartDate}', 'YYYY-MM-DD') + 1 )
            SELECT DISTINCT A.INDATE, NVL(B.REASON, TO_CHAR(A.INDATE, 'Day')) AS DAY FROM Date_Range A LEFT JOIN (SELECT B.NHDATE, 
            B.REASON, A.COMPCODE FROM NHDAYA A JOIN NHDAYB B ON A.NHDAYAID = B.NHDAYAID JOIN (SELECT DISTINCT A.COMPCODE FROM 
            HDATTA${tableSuffix} A WHERE A.IDCARDNO = ${val.idCardNo}) C ON A.COMPCODE = C.COMPCODE) B ON A.INDATE = B.NHDATE) A 
            LEFT JOIN (SELECT * FROM HDATTA${tableSuffix} WHERE IDCARDNO = ${val.idCardNo}) B ON A.INDATE = B.INDATE ORDER BY 
            A.INDATE ASC`;

            result = await connection.execute(sql, binds2, options);

            if (result && result.rows.length > 0) {
                finalResults = finalResults.concat(result.rows);
            }
            cnt++;
        }

        finalResults.forEach(record => {
            const inDate = moment(record.INDATE);
            if (inDate.day() === 0 &&
                (!record.INTIME && !record.OUTTIME)) {
                record.INTIME = "WH";
                record.OUTTIME = "WH";
            } else {
                for (let i = 0; i < result1.rows.length; i++) {
                    let inDate = moment(record.INDATE);
                    let fromDt = moment(result1.rows[i].FROMDT);


                    if (inDate.isSame(fromDt, 'day')) {
                        record.INTIME = "EL";
                        record.OUTTIME = "EL";
                        break; // Exit the loop if condition is met
                    }
                }

            }
        });


        if (finalResults.length > 0) {
            return { response: finalResults, message: true };
        } else {
            return { message: false };
        }
    } catch (e) {
        console.log("getAttendance error", e.message);
        return { message: false };
    } finally {
        try {
            if (connection) {
                await connection.close();
            }
        } catch (e) {
            console.log("Error closing connection", e.message);
        }
    }
}




async function getPaySlip(val) {
    let connection, sql, binds2, options, result, resultObj
    try {
        connection = await oracle.getConnection(dbconfig)
        binds2 = {}
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        }

        sql = `SELECT b.COMPANYNAME, a.EMPMAID FROM empma a, compa b 
               WHERE b.COMPAID = a.COMPCODE AND a.EMPID = '${val.idCardNo}' AND b.TYPE = 'Group'`

        result = await connection.execute(sql, binds2, options)

        if (result.rows.length > 0) {
            const companyName = result.rows[0].COMPANYNAME
            const empmaid = result.rows[0].EMPMAID

            let sql2 = `SELECT * FROM ${companyName}hpayroll WHERE empid = ${empmaid} AND PAYPERIOD='${val.sdate}'  ORDER BY TO_DATE(PAYPERIOD, 'Month YYYY') DESC`

            let result1 = await connection.execute(sql2, binds2, options)

            let tempDate = moment(result1.rows[0].PAYPERIOD)

            const weekdaysCount = getAmountOfWeekDaysInMonth(tempDate, 0);

            return { response: result1.rows, weekdaysCount: weekdaysCount, message: true }
        } else {
            return { message: false }
        }
    } catch (e) {
        console.log("getPaySlip", e.message);
        return resultObj = { message: false }
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("getPaySlip Connection", e.message);
        }
    }
    function getAmountOfWeekDaysInMonth(date, weekday) {
        date.date(0);
        var dif = (7 + (weekday - date.weekday())) % 7 + 1;
        return Math.floor((date.daysInMonth() - dif) / 7) + 1;
    }
};



async function updatePermissionApproval(val) {
    let connection, sql, binds2, options, result, resultObj
    try {
        for (let i = 0; i < val.length; i++) {

            sql = `UPDATE MPERMAS SET APPROVE='${val[i].APPR}' , REJECT='${val[i].REJ}' WHERE IDCARDNO='${val[i].IDCARDNO}' 
             AND FROMTIME = TO_DATE('${val[i].FROMTIM}', 'HH:MI:SS AM') AND TOTIME= TO_DATE('${val[i].TOTIME}', 'HH:MI:SS AM')`;

            connection = await oracle.getConnection(dbconfig)
            binds2 = {}
            options = {
                outFormat: oracle.OUT_FORMAT_OBJECT
            }
            result = await connection.execute(sql, binds2, options)
            await connection.commit()
        }
        if (result.rowsAffected > 0) {
            return { response: result.rows, message: "success" }
        } else {
            return { response: result.rows, message: "failure" }
        }
    } catch (e) {
        console.log("updatePermissionApproval", e.message);
        return resultObj = { message: false }
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("Error updatePermissionApproval", e.message);
        }
    }
};

async function Permissionreq(loginid) {
    let sql, result, binds, connection, option, result2, result4, result3;
    try {
        connection = await oracle.getConnection(dbconfig);

        sql = `SELECT FROMTIME, TOTIME, APPROVE, REJECT, 
            CASE 
                WHEN APPROVE = 'Y' AND REJECT = 'N' THEN 'Approved'
                WHEN APPROVE = 'N' AND REJECT = 'Y' THEN 'Rejected'
                ELSE 'Pending'
            END AS STATUS,REASON,TOTHRS,PDATE
        FROM MPERMAS
        WHERE IDCARDNO = '${loginid}'`;


        binds = {};
        option = { outFormat: oracle.OUT_FORMAT_OBJECT };
        result = await connection.execute(sql, binds, option);


        return {
            message: "success",
            response: result.rows
        };
    } catch (e) {
        console.log("Permissionreq", e.message);
        return { message: "Error", error: e.message };
    } finally {
        try {
            if (connection) {
                await connection.close();
            }
        } catch (e) {
            console.log("Permissionreq connection", e.message);
        }
    }
}

async function getPermissionApprovalData(val) {
    let connection, sql, binds2, options, result, resultObj
    try {
        connection = await oracle.getConnection(dbconfig)
        binds2 = {}
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        }

        sql = `select a.*,B.EMPNAME, B.DEPTNAME from MPERMAS a, EMPMA b where 
        A.IDCARDNO = B.IDCARDNO and B.UNDERHEADEMPID =${val.loginid} and a.APPROVE='N' 
        and a.REJECT='N'  `


        result = await connection.execute(sql, binds2, options)

        if (result.rows.length > 0) {
            return { response: result.rows, message: true }
        } else {
            return { message: false }
        }
    } catch (e) {
        console.log("getPermissionApprovalData", e.message);
        return resultObj = { message: false }
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("Error getPermissionApprovalData", e.message);
        }
    }
};

async function timePerimission(val) {
    let connection, sql, binds2, options, result, resultObj, result2, result3;
    try {
        sql = `select COUNT(PDATE) ENTRIES from MPERMAS WHERE PDATE = To_DATE('${val.ENTRIES}', 'DD/MM/YYYY')  
        AND IDCARDNO='${val.idcardno}'  AND REJECT  = 'N' `;

        connection = await oracle.getConnection(dbconfig);
        binds2 = {};
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        };
        result = await connection.execute(sql, binds2, options);

        let sql2 = `SELECT COUNT(PDATE) AS ENTRIES
        FROM MPERMAS
        WHERE EXTRACT(MONTH FROM PDATE) = EXTRACT(MONTH FROM TO_DATE('${val.ENTRIES}', 'DD/MM/YYYY'))
        AND EXTRACT(YEAR FROM PDATE) = EXTRACT(YEAR FROM TO_DATE('${val.ENTRIES}', 'DD/MM/YYYY')) AND IDCARDNO='${val.idcardno}'  AND REJECT  = 'N'`;
        result3 = await connection.execute(sql2, binds2, options);

        let tempDate = moment(val.ENTRIES, 'DD/MM/YYYY');
        const saturdays = getSaturdaysInMonth(tempDate);


        if (saturdays.length > 0) {
            sql = `SELECT COUNT(PDATE) AS ENTRIES
            FROM MPERMAS
            WHERE TO_CHAR(PDATE, 'MM/YYYY') = TO_CHAR(TO_DATE('${val.ENTRIES}', 'DD/MM/YYYY'), 'MM/YYYY')
            AND TO_CHAR(PDATE, 'DY', 'NLS_DATE_LANGUAGE=ENGLISH') = 'SAT' AND IDCARDNO='${val.idcardno}'  AND REJECT  = 'N'`;

            connection = await oracle.getConnection(dbconfig);
            binds2 = {};
            options = {
                outFormat: oracle.OUT_FORMAT_OBJECT
            };
            result2 = await connection.execute(sql, binds2, options);
        }

        if (result.rows.length > 0) {
            return { response: result.rows, saturdays: saturdays, response2: result2.rows, response3: result3.rows, message: "success" };
        } else {
            return { response: result.rows, message: "failure" };
        }
    } catch (e) {
        console.log("timePerimission", e.message);
        return resultObj = { message: false };
    } finally {
        try {
            if (connection) {
                await connection.close();
            }
        } catch (e) {
            console.log("timePerimission Connection", e.message);
        }
    }

    function getSaturdaysInMonth(date) {
        let saturdays = [];
        let current = date.clone().startOf('month');

        while (current.month() === date.month()) {
            if (current.day() === 6) {
                saturdays.push(current.clone().format('DD/MM/YYYY'));
            }
            current.add(1, 'day');
        }
        return saturdays;
    }
};



async function permissionreqcancel(val) {
    let connection, sql, binds2, options, result, resultObj
    try {
        connection = await oracle.getConnection(dbconfig)
        binds2 = {}
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        }

        sql = `DELETE FROM MPERMAS WHERE IDCARDNO = '${val.idcardno}' AND PDATE = TO_DATE('${val.pdate}', 'DD/MM/YYYY')`

        result = await connection.execute(sql, binds2, options)
        await connection.commit()

        if (result.rowsAffected > 0) {
            return { message: true };
        } else {
            return { message: false };
        }
    } catch (e) {
        console.log("getPermissionApprovalData", e.message);
        return resultObj = { message: false }
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("Error getPermissionApprovalData", e.message);
        }
    }
};

async function ondutyreqcancel(val) {
    let connection, sql, binds2, options, result, resultObj
    try {
        connection = await oracle.getConnection(dbconfig)
        binds2 = {}
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        }

        sql = ` DELETE FROM MONDUTYMAS WHERE IDCARDNO = '${val.idcardno}' AND FROMTIME = TO_DATE('${val.fromTime}', 'DD/MM/YYYY HH:MI:SS PM')
        AND TOTIME = TO_DATE('${val.toTime}', 'DD/MM/YYYY HH:MI:SS PM') AND TOTHRS = '${val.totHrs}'`

        result = await connection.execute(sql, binds2, options)
        await connection.commit()

        if (result.rowsAffected > 0) {
            return { message: true };
        } else {
            return { message: false };
        }
    } catch (e) {
        console.log("getPermissionApprovalData", e.message);
        return resultObj = { message: false }
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("Error getPermissionApprovalData", e.message);
        }
    }
};

async function leavereqcancel(val) {
    let connection, sql, binds2, options, result, resultObj, result1;
    try {
        connection = await oracle.getConnection(dbconfig)
        binds2 = {}
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        }

        sql = `DELETE FROM MLEAVEMAS WHERE IDCARDNO = '${val.idcardno}' AND FROMDT = TO_DATE('${val.from}', 'DD/MM/YYYY') 
        AND TODT = TO_DATE('${val.to}', 'DD/MM/YYYY') AND TORLEVDAYS = '${val.totdays}'`

        result = await connection.execute(sql, binds2, options)
        await connection.commit()

        sql = `DELETE FROM mleavedet WHERE empid = '${val.idcardno}' 
        AND LDATE BETWEEN TO_DATE('${val.from}', 'DD/MM/YYYY') AND TO_DATE('${val.to}', 'DD/MM/YYYY')`

        result1 = await connection.execute(sql, binds2, options)
        await connection.commit()

        if (result.rowsAffected > 0) {
            return { message: true };
        } else {
            return { message: false };
        }
    } catch (e) {
        console.log("leavereqcancel", e.message);
        return resultObj = { message: false }
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("Error leavereqcancel", e.message);
        }
    }
};

async function odtype(val) {
    let connection, sql, binds2, options, result, resultObj
    try {
        connection = await oracle.getConnection(dbconfig)
        binds2 = {}
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        }

        sql = `select odcnt from EMPMA where empid='${val.idcardno}'`



        result = await connection.execute(sql, binds2, options)
        await connection.commit()

        let sql2 = `select count(MODIFIEDON) ENTCNT  from  EMPMA where
         TO_CHAR(MODIFIEDON, 'MM/YYYY') = TO_CHAR(TO_DATE('${moment(val.date).format('YYYY-MM-DD')}', 'YYYY/MM/DD'), 'MM/YYYY') AND IDCARDNO='${val.idcardno}'`

        let result2 = await connection.execute(sql2, binds2, options)
        await connection.commit()

        if (result.rows.length > 0) {
            return { response1: result.rows[0], response2: result2.rows[0], message: true };
        } else {
            return { message: false };
        }
    } catch (e) {
        console.log("odtype", e.message);
        return resultObj = { message: false }
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("Error odtype", e.message);
        }
    }
};


async function applogin(val) {
    let connection, sql, binds2, options, result, resultObj
    try {
        connection = await oracle.getConnection(dbconfig)
        binds2 = {}
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        }

        sql = `INSERT INTO temptable (userid, macaddress)
             VALUES ('${val.UserId}', '${val.MacAddress}')`



        result = await connection.execute(sql, binds2, options)
        await connection.commit()


        if (result.rowsAffected > 0) {
            return { response1: result, message: true };
        } else {
            return { message: false };
        }
    } catch (e) {
        console.log("odtype", e.message);
        return resultObj = { message: false }
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("Error odtype", e.message);
        }
    }
};



async function getusername(val) {
    let connection, sql, binds2, options, result, resultObj
    try {
        connection = await oracle.getConnection(dbconfig)
        binds2 = {}
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        }

        sql = `select empname from empma where idcardno = ${val.idCardNo}`
        result = await connection.execute(sql, binds2, options)

        // console.log(result.rows[0].EMPNAME, "empname")
        // console.log(result.rows[0], "esult.rows[0]")

        if (result.rows.length > 0) {
            return { response1: result.rows[0], message: true };
        } else {
            return { message: false };
        }
    } catch (e) {
        console.log("getusername", e.message);
        return resultObj = { message: false }
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("Error getusername", e.message);
        }
    }
};


async function dasbord(val) {
    let connection, sql, binds2, options, result1, result2, result3, result4, result5, result6, resultObj
    try {
        connection = await oracle.getConnection(dbconfig)
        binds2 = {}
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        }

        sql = ` select a.*,B.EMPNAME, B.DEPTNAME from mleavemas a, EMPMA b where 
        A.IDCARDNO = B.IDCARDNO and B.UNDERHEADEMPID =${val.loginid} and a.APPROVE='N' 
        and a.REJECT='N'`



        result1 = await connection.execute(sql, binds2, options)
        await connection.commit()

        sql = ` select a.*,B.EMPNAME, B.DEPTNAME from MPERMAS a, EMPMA b where 
        A.IDCARDNO = B.IDCARDNO and B.UNDERHEADEMPID =${val.loginid} and a.APPROVE='N' 
        and a.REJECT='N'`



        result2 = await connection.execute(sql, binds2, options)
        await connection.commit()

        sql = `select a.*,B.EMPNAME, B.DEPTNAME from MONDUTYMAS a, EMPMA b where 
        A.IDCARDNO = B.IDCARDNO and B.UNDERHEADEMPID =${val.loginid} and a.APPROVE='N' 
        and a.REJECT='N'`



        result3 = await connection.execute(sql, binds2, options)
        await connection.commit()

        sql = `SELECT FROMTIME, TOTIME, APPROVE, REJECT, 
            CASE 
                WHEN APPROVE = 'Y' AND REJECT = 'N' THEN 'Approved'
                WHEN APPROVE = 'N' AND REJECT = 'Y' THEN 'Rejected'
                ELSE 'Pending'
            END AS STATUS,REASON,TOTHRS,PDATE
        FROM MPERMAS
        WHERE IDCARDNO = '${val.loginid}'`



        result5 = await connection.execute(sql, binds2, options)
        await connection.commit()

        sql = `SELECT FROMDT, TODT, APPROVE, REJECT, 
            CASE 
                WHEN APPROVE = 'Y' AND REJECT = 'N' THEN 'Approved'
                WHEN APPROVE = 'N' AND REJECT = 'Y' THEN 'Rejected'
                ELSE 'Pending'
            END AS STATUS,PURPOSE,TOTDAYS
        FROM MLEAVEMAS
        WHERE IDCARDNO = '${val.loginid}'`



        result4 = await connection.execute(sql, binds2, options)
        await connection.commit()

        sql = `SELECT FROMTIME, TOTIME, APPROVE, REJECT, 
            CASE 
                WHEN APPROVE = 'Y' AND REJECT = 'N' THEN 'Approved'
                WHEN APPROVE = 'N' AND REJECT = 'Y' THEN 'Rejected'
                ELSE 'Pending'
            END AS STATUS,REASON,TOTHRS,PDATE
        FROM MONDUTYMAS
        WHERE IDCARDNO = '${val.loginid}'`



        result6 = await connection.execute(sql, binds2, options)
        // await connection.commit()

        sql = `SELECT * FROM stfopdet WHERE empid = '${val.loginid}'`;
        let getFopDet = await connection.execute(sql, binds2, options);

        let EL, AT;
        if (getFopDet.rows.length > 0) {
            sql = `SELECT NVL(opeldays, 0) EL FROM stfopmas a, stfopdet b 
                   WHERE A.STFOPMASID = B.STFOPMASID 
                   AND finyr = TO_CHAR(SYSDATE, 'YYYY')
                   AND empid = '${val.loginid}'`;

            EL = await connection.execute(sql, binds2, options);
        } else {
            EL = { rows: [{ EL: 0 }] }; // Initialize result2 with default value
        }

        sql = `SELECT NVL(SUM(ldays), 0) AT FROM payroll.stfleavemas a, payroll.stfleavedet b 
               WHERE A.STFLEAVEMASID = b.STFLEAVEMASID 
               AND lyear = TO_CHAR(SYSDATE, 'yyyy') 
               AND empid = '${val.loginid}' 
               AND type = 'EL'`;
        AT = await connection.execute(sql, binds2, options);

        resultObj = {
            leaveApprovalDetails: result1.rows, message: true,
            permissioApprovalDetails: result2.rows, message: true,
            ondutyApprovalDetails: result3.rows, message: true,
            leavereqDetails: result4.rows, message: true,
            permissionDetails: result5.rows, message: true,
            ondutyreqDetails: result6.rows, message: true,
            EL: EL.rows[0].EL,
            AT: AT.rows[0].AT
        }
        return resultObj;

        // if (result.rows.length> 0) {
        //     return { response1: result.rows[0], message: true };

        //     resultObj={result1:result.rows}
        // } else {
        //     return { message: false };
        // }
    } catch (e) {
        console.log("getusername", e.message);
        return resultObj = { message: false }
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("Error getusername", e.message);
        }
    }
};



async function userdevice(val) {
    let connection, sql, binds2, options, result, resultObj, result1;
    try {
        connection = await oracle.getConnection(dbconfig)
        binds2 = {}
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        }
        sql = `select DEVICETOKEN from  userdevice where deviceid = '${val.deviceID}'`
        result1 = await connection.execute(sql, binds2, options)
        await connection.commit()

        // console.log(result1.rows[0].DEVICETOKEN)
        if (result1.rows.length > 0) {
            if (val.devicetoken !== result1.rows[0].DEVICETOKEN) {
                sql = `UPDATE userdevice SET devicetoken = '${val.deviceToken}' WHERE deviceid = '${val.deviceID}'`

                result = await connection.execute(sql, binds2, options)
                await connection.commit()
            }

        } else {
            sql = `INSERT INTO userdevice (deviceid, devicetoken) VALUES ('${val.deviceID}', '${val.deviceToken}')`
            result = await connection.execute(sql, binds2, options)
            await connection.commit()
        }

        if (result.rowsAffected > 0) {
            return { message: true };
        } else {
            return { message: false };
        }
    } catch (e) {
        console.log("userdevice", e.message);
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("Error userdevice", e.message);
        }
    }
};



async function underhead(val, res) {
    let connection, sql, binds2, options, result1;
    try {
        connection = await oracle.getConnection(dbconfig)

        sql = `select * from empma where UNDERHEADEMPID=  ${val.loginid.idCardNo}`
        binds2 = {}
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        }
        result1 = await connection.execute(sql, binds2, options)


        if (result1.rows.length > 0) {
            res.send({ message: true, response: result1.rows })
        } else {
            res.send({ message: false });
        }
    } catch (e) {
        console.log("UNDERHEADEMPID", e.message);
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("Error UNDERHEADEMPID", e.message);
        }
    }
};


async function ioslogin(val) {
    //console.log(val);
    let connection, sql, binds2, options, result1, result2;
    try {
        connection = await oracle.getConnection(dbconfig)

        sql = `select * from MOBILE_APP_USERS where idcardno ='${val.idcardno}' and password ='${val.password}'`
        binds2 = {}
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        }
        result1 = await connection.execute(sql, binds2, options)

        if (result1.rows.length > 0) {
            // sql = `UPDATE MOBILE_APP_USERS SET TYPE = 'IOS' WHERE  idcardno = '${val.idcardno}'`
            // binds2 = {}
            // options = {
            //     outFormat: oracle.OUT_FORMAT_OBJECT
            // }
            // result2 = await connection.execute(sql, binds2, options)
            // await connection.commit()
            return { status: true, response: result1.rows }
        } else {
            return { status: false }
        }
    } catch (e) {
        console.log("UNDERHEADEMPID", e.message);
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("Error UNDERHEADEMPID", e.message);
        }
    }
};


async function iosResigistinsertData(val) {
    let connection, sql, binds2, options, result, resultObj1, result5
    try {

        console.log(val, "register")
        connection = await oracle.getConnection(dbconfig)

        sql = `select idcardno from MOBILE_APP_USERS where idcardno= ${val.IDCARDNO} and dob = TO_DATE('${val.DOB}', 'YYYY-MM-DD')
        and deviceid = '${val.DEVICEID}'`
        binds2 = {}
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        }

        let result4 = await connection.execute(sql, binds2, options)

        if (result4.rows.length > 0) {
            sql = `UPDATE MOBILE_APP_USERS SET password = '${val.PASSWORD}'
            WHERE  idcardno= '${val.IDCARDNO}' and dob = TO_DATE('${val.DOB}', 'YYYY-MM-DD')`
            result = await connection.execute(sql, binds2, options);
            await connection.commit()

            if (result.rowsAffected > 0) {
                return { status: true, message: "Password is updated." }
            }
        }

        sql = `SELECT * FROM empma WHERE idcardno = '${val.IDCARDNO}' AND dob = TO_DATE('${val.DOB}', 'YYYY-MM-DD')`
        binds2 = {};
        console.log(sql, "sql")
        let result5 = await connection.execute(sql, binds2, options)

        if (result5.rows.length === 0) {
            return { status: false, message: "The Date of Birth and ID Card Number do not match for the same user" }
        }

        sql = `SELECT * FROM empma WHERE idcardno = '${val.IDCARDNO}' AND dob = TO_DATE('${val.DOB}', 'YYYY-MM-DD')`
        binds2 = {};
        console.log(sql, "sql")
        let result6 = await connection.execute(sql, binds2, options)

        if (result5.rows.length > 0) {
            return { status: false, message: "This ID card is already registered" }
        } else {
            let sql2 = `select DEVICETOKEN from  userdevice where deviceid = '${val.DEVICEID}'`;
            binds2 = {};
            let result3 = await connection.execute(sql2, binds2, options);

            if (result3.rows.length === 0) {
                return { status: false, message: "No valid device token found" }
            }
            // console.log(result5.rows[0].DOJ)
            const dojDate = moment(result5.rows[0].DOJ).format("YYYY-MM-DD");

            sql = `INSERT INTO MOBILE_APP_USERS (USERNAME,PASSWORD,IDCARDNO,EMPMAID,MOBILENO,DEVICEID,EMPNAME,DOB,IMAGEPATH,IMAGEAPP,
              APPROVAL,CREATEDON,DEVICETOKEN,TYPE,DOJ) VALUES('${val.USERNAME}','${val.PASSWORD}','${val.IDCARDNO}','${result5.rows[0].EMPMAID}',
              ${result5.rows[0].PANNO},'${val.DEVICEID}','${result5.rows[0].EMPNAME}', TO_DATE('${val.DOB}', 'YYYY-MM-DD'),null,null,
             'T',SYSDATE,'${result3.rows[0].DEVICETOKEN}','${val.TYPE}',TO_DATE('${dojDate}', 'YYYY-MM-DD'))`

            //console.log(sql)

            connection = await oracle.getConnection(dbconfig)
            binds2 = {}
            options = {
                outFormat: oracle.OUT_FORMAT_OBJECT
            }
            result = await connection.execute(sql, binds2, options)
            await connection.commit()

            if (result.rowsAffected > 0) {
                resultObj1 = { status: true, message: "Registration successful.", values: result.rows }
            } else {
                resultObj1 = { status: false, message: "Registration unsuccessful." }
            }
            return resultObj1
        }
    } catch (e) {
        console.log("ResigistinsertData", e.message);
        return resultObj1 = { status: false, message: "Registration unsuccessful." }
    } finally {
        try {
            if (connection) {
                await connection.close()

            }
        } catch (e) {
            console.log("Error ResigistinsertData", e.message);
        }
    }
};


module.exports = {
    ResigistinsertData,
    registerget,
    mleavemasdetData,
    leavelogin,
    mpermissionmasData,
    OpeldaysData,
    ApprovalData,
    Employeedetails,
    shiftDetails,
    updateLeaveApproval,
    leaverequestshow,
    getpermission,
    insertonduty,
    odpunch,
    Ondutyreq,
    updateOndutyApproval,
    getondutyApprovalData,
    getAttendance,
    getPaySlip,
    updatePermissionApproval,
    Permissionreq,
    getPermissionApprovalData,
    timePerimission,
    permissionreqcancel,
    ondutyreqcancel,
    leavereqcancel,
    odtype,
    applogin,
    getusername,
    dasbord,
    userdevice,
    underhead,
    ioslogin,
    iosResigistinsertData
    // OndutyDetailsData

}