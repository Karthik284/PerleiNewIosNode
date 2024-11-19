const dbconfig={
    user          :  "GARMENT",
    password      :  "log",
    connectString : '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=192.168.1.123)(PORT=1521))(CONNECT_DATA=(SID=xe)))'
}

const oracle = require("oracledb")


async function leavelogin(value) {
    let sql, binds, connection, options, result;
    try {
        connection = await oracle.getConnection(dbconfig);

        // Use bind variable to safely insert the IDCARDNO
        sql = `SELECT USERNAME FROM AXUSERS WHERE USERNAME = '${value.USERNAME}'
        AND PASSWORD='${value.PASSWORD}' `;
        // console.log(sql, "sql");

        // Bind the IDCARDNO value to prevent SQL injection
        binds = {};
        options = { outFormat: oracle.OUT_FORMAT_OBJECT };

        result = await connection.execute(sql, binds, options);
        await connection.commit();

        return { message: "Success", response: result.rows };
    } catch (e) {
        console.log("leavelogin:" + e.message);
        return { message: "Error", error: e.message };
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (e) {
                console.log("leavelogin connection:" + e.message);
            }
        }
    }
};

async function getLineName() {
    let connection, sql, binds2, options, result, resultObj
    try {
        connection = await oracle.getConnection(dbconfig)
        binds2 = {}
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        }

        sql = `SELECT PARTYID FROM GARMENT.PARTYMAS WHERE LINE = 'T' AND ACTIVE ='T' ORDER BY PARTYID`

          //console.log(sql,"AAAAA");
       
        result = await connection.execute(sql, binds2, options)

        if(result.rows.length>0){
            return {response: result.rows, message: true}
        }else{
            return {message: false} 
        }
    } catch (e) {
        console.log("Error 25", e.message);
        return resultObj = { message: false }
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("Error 25", e.message);
        }
    }
};

async function getEmpName(val) {
    let connection, sql, binds2, options, result, resultObj
    try {
        connection = await oracle.getConnection(dbconfig)
        binds2 = {}
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        }

        sql = `SELECT EMPID, EMPNAME, LINENAME, DEPTNAME FROM PAYROLL.EMPLINEMAS WHERE EMPID = '${val.EMPID}'`

        //   console.log(sql,"AAAAA");
       
        result = await connection.execute(sql, binds2, options)

        if(result.rows.length>0){
            return {response: result.rows, message: true}
        }else{
            return {message: false} 
        }
    } catch (e) {
        console.log("Error 25", e.message);
        return resultObj = { message: false }
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("Error 25", e.message);
        }
    }
};

async function updateEmpLine(val) {
    let connection, sql, binds2, options, result, resultObj
    try {
        connection = await oracle.getConnection(dbconfig)
        binds2 = {}
        options = {
            outFormat: oracle.OUT_FORMAT_OBJECT
        }

        for(let i=0;i<val.data.length;i++){
        sql = `INSERT INTO GARMENT.LINEEMPLOGTABLE (EMPID, EMPNAME, CREATEDON, ALLOCATEDLINENAME, LINENAME, PREPAREDBY,
 CREATEDBY, CDATE, CTIME) VALUES (${val.data[i].EMPID}, '${val.data[i].EMPNAME}', sysdate, '${val.data[i].ALINE}', '${val.data[i].LINENAME}',
  '${val.USERNAME}', '${val.USERNAME}', TO_DATE(TO_CHAR(sysdate, 'DD-MM-YYYY'), 'DD-MM-YYYY'),
   TO_DATE(TO_CHAR(sysdate, 'HH24:MI:SS'), 'HH24:MI:SS'))`

          //console.log(sql,"AAAAA");
       
        result = await connection.execute(sql, binds2, options)
        await connection.commit()
        }

        if(result.rowsAffected>0){
            return {message: true}
        }else{
            return {message: false} 
        }
    } catch (e) {
        console.log("Error 25", e.message);
        return resultObj = { message: false }
    } finally {
        try {
            if (connection) {
                await connection.close()
            }
        } catch (e) {
            console.log("Error 25", e.message);
        }
    }
};

module.exports={
    leavelogin,
    getLineName,
    getEmpName,
    updateEmpLine
}