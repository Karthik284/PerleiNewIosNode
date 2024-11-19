const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const Mobdetails = require("./Mobdetails.js")
const LineEmp = require('./LineEmp.js')

const app = express();
const port = 4887;
const version = "v1"

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

var admin = require("firebase-admin");

var serviceAccount = require("./perlei-mobilenotification-firebase-adminsdk-hq11f-7e503f7bd0.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'perlei-mobilenotification'
});

const messaging = admin.messaging();


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

app.use(express.static(path.join(__dirname + "/iosbuild")));

app.get(`/`, function (req, res) {
    console.log("Request received");
    res.sendFile(path.join(__dirname + "/iosbuild/index.html"));
});

app.use(express.static(path.join(__dirname + "/build")));

app.get(`/${version}/:id`, function (req, res) {
    console.log("Request received");
    res.sendFile(path.join(__dirname + "/build/index.html"));
});

app.post("/send", function (req, res) {
    // const receivedToken = req.body.fcmToken;



});

async function token() {
    const receivedToken = "c0zLlmFoQWS5QKk6x80ovr:APA91bErVU2O_zQdRuDs4fJyqTat-Q93_Kr9tEAuEY8ynl10HuRz1dBFcGglkHSxRf7J5xif9NuhHDznUhqz6l6ssdF0-eJsx5JFTTu-I0z-iXH6KX3IQTM"
    const message = {
        notification: {
            title: "Notif",
            body: 'This is a Test Notification'
        },
        token: receivedToken,
    };

    messaging
        .send(message)
        .then((response) => {
            // res.status(200).json({
            //   message: "Successfully sent message",
            //   token: receivedToken,
            // });
            console.log("Successfully sent message:", response);
        })
        .catch((error) => {
            // res.status(400);
            // res.send(error);
            console.log("Error sending message:", error);
        });

}


app.get(`/${version}/api/getRegister/:idcardno/:empname`, (req, res) => {
    Mobdetails.registerget(req.params.idcardno, req.params.empname).then((result) => {
        res.send(result);
    }).catch((error) => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    });
});


app.post(`/${version}/api/Registerinsert`, (req, res) => {
    Mobdetails.ResigistinsertData(req.body).then((result) => {
        // console.log(result);
        res.send(result);
    }).catch((error) => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    });
});


// app.post('/api/mleavemasdet', (req, res) => {
//     console.log(req.body,req.body.leaveDetails,"req.body.leaveDetails")
//     Mobdetails.mleavemasdetData(req.body,req.body.leaveDetails).then((result) => {
//         res.send(result);
//     }).catch((error) => {
//         console.error(error);
//         res.status(500).send({ error: 'Internal Server Error' });
//     });
// });

app.post(`/${version}/api/leave`, async (req, res) => {
    const val = req.body;
    const leaveDetails = val.leaveDetails;
    try {
        const result = await Mobdetails.mleavemasdetData(val, leaveDetails, messaging);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post(`/${version}/api/LoginData`, async (req, res) => {
    Mobdetails.leavelogin(req.body).then((result) => {
        res.send(JSON.stringify(result));
    }).catch((error) => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    })

});

app.post('/api/lineEmpLoginData', async (req, res) => {
    LineEmp.leavelogin(req.body).then((result) => {
        res.send(result);
    }).catch((error) => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    })

});


app.post(`/${version}/api/mpermissionMas`, (req, res) => {
    Mobdetails.mpermissionmasData(req.body, messaging).then((result) => {
        res.send(result);
    }).catch((error) => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    });
});

app.post(`/${version}/api/OndutyDetails`, (req, res) => {
    Mobdetails.OndutyDetailsData(req.body, messaging).then((result) => {
        res.send(result);
    }).catch((error) => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    });
});

app.post(`/${version}/api/OpeldaysData`, (req, res) => {
    Mobdetails.OpeldaysData(req.body).then((result) => {
        res.send(result);
    }).catch((error) => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    });
});

app.post(`/${version}/api/ApprovalDetails`, (req, res) => {
    Mobdetails.ApprovalData(req.body).then((result) => {
        res.send(result);
    }).catch((error) => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    });
});

app.post('/api/empdelails', (req, res) => {
    Mobdetails.Employeedetails(req.body).then((result) => {
        res.send(result);
    }).catch((error) => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    });
});


app.post(`/${version}/api/shiftdetails`, (req, res) => {
    Mobdetails.shiftDetails(req.body).then((result) => {
        res.send(result);
    }).catch((error) => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    });
});


app.post(`/${version}/updateLeaveApproval`, (req, res) => {
    Mobdetails.updateLeaveApproval(req.body).then((result) => {
        res.send(result);
    }).catch((error) => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    });
});

app.post(`/${version}/api/leaverequestshow`, async (req, res) => {
    try {
        const data = await Mobdetails.leaverequestshow(req.body.loginid)
        res.send(data)

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
})

app.post(`/${version}/api/getpermission`, async (req, res) => {
    try {
        const data = await Mobdetails.getpermission(req.body.loginid)
        res.send(data)
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
})


app.post(`/${version}/api/insertonduty`, async (req, res) => {
    try {
        const result = await Mobdetails.insertonduty(req.body, messaging)
        res.send(result)
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
})




app.post(`/${version}/api/odpunch`, async (req, res) => {
    try {
        const result = await Mobdetails.odpunch(req.body)
        res.send(result)

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
})


app.post(`/${version}/api/getondutyreq`, async (req, res) => {
    try {
        const data = await Mobdetails.Ondutyreq(req.body.loginid)
        res.send(data)
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
})

app.post(`/${version}/updateOndutyApproval`, (req, res) => {
    Mobdetails.updateOndutyApproval(req.body).then((result) => {
        res.send(result);
    }).catch((error) => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    });
});


app.post(`/${version}/api/OndutyApprovalDetails`, (req, res) => {
    Mobdetails.getondutyApprovalData(req.body).then((result) => {
        res.send(result);
    }).catch((error) => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    });
});


app.post('/api/getLineName', (req, res) => {
    LineEmp.getLineName().then((result) => {
        res.send(result);
    }).catch((error) => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    });
});

app.post('/api/getScannedEmpData', (req, res) => {
    LineEmp.getEmpName(req.body).then((result) => {
        res.send(result);
    }).catch((error) => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    });
});



app.post('/api/updateLineEmpDate', (req, res) => {
    LineEmp.updateEmpLine(req.body).then((result) => {
        res.send(result);
    }).catch((error) => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    });
});

app.post(`/${version}/api/getAttendance`, (req, res) => {
    Mobdetails.getAttendance(req.body).then((result) => {
        res.send(result);
    }).catch((error) => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    });
});

app.post(`/${version}/api/getPaySlip`, (req, res) => {
    Mobdetails.getPaySlip(req.body).then((result) => {
        res.send(result);
    }).catch((error) => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    });
});

app.post(`/${version}/api/updatePermissionApproval`, (req, res) => {
    Mobdetails.updatePermissionApproval(req.body).then((result) => {
        res.send(result);
    }).catch((error) => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    });
});

app.post(`/${version}/api/getPermissionreq`, async (req, res) => {
    try {
        const data = await Mobdetails.Permissionreq(req.body.loginid)
        res.send(data)

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
})

app.post(`/${version}/api/PermissionDetails`, (req, res) => {
    Mobdetails.getPermissionApprovalData(req.body).then((result) => {
        res.send(result);
    }).catch((error) => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    });
});

app.post(`/${version}/api/timePermission`, (req, res) => {
    Mobdetails.timePerimission(req.body).then((result) => {
        res.send(result);
    }).catch((error) => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    });
});


app.post(`/${version}/api/permissionreqcancel`, (req, res) => {
    Mobdetails.permissionreqcancel(req.body).then((result) => {
        res.send(result);
    }).catch((error) => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    });
});

app.post(`/${version}/api/ondutyreqcancel`, (req, res) => {
    Mobdetails.ondutyreqcancel(req.body).then((result) => {
        res.send(result);
    }).catch((error) => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    });
});

app.post(`/${version}/api/leavereqcancel`, (req, res) => {
    Mobdetails.leavereqcancel(req.body).then((result) => {
        res.send(result);
    }).catch((error) => {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    });
});


app.post(`/${version}/api/typeod`, async (req, res) => {
    try {
        const result = await Mobdetails.odtype(req.body)
        res.send(result)
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
})



app.post(`/${version}/api/applogin`, async (req, res) => {
    try {
        const result = await Mobdetails.applogin(req.body)
        res.send(result)
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
})

app.post(`/${version}/api/getusername`, async (req, res) => {

    try {
        const result = await Mobdetails.getusername(req.body)
        res.send(result)
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
})

app.post(`/${version}/api/dashbord`, async (req, res) => {

    try {
        const result = await Mobdetails.dasbord(req.body)
        res.send(result)
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
})

app.post(`/${version}/api/userdevice`, async (req, res) => {
    try {
        const result = await Mobdetails.userdevice(req.body)
        res.send(result)
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
})


app.post(`/${version}/api/underhead`, async (req, res) => {
    try {
          await Mobdetails.underhead(req.body, res)
        // res.send(result)
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
})


app.post(`/${version}/api/ioslogin`, async (req, res) => {
    try {
        console.log(req.body)

        // const result = await Mobdetails.ioslogin(req.body)
        //  res.send(result)

        res.send({ status: true, response: [
            {
              USERNAME: 'ILAKKIYA',
              PASSWORD: '81dc9bdb52d04dc20036dbd8313ed055',
              IDCARDNO: '6146',
              EMPMAID: 10625000000052,
              MOBILENO: 9790415571,
              DEVICEID: null,
              EMPNAME: 'ILAKKIYA',
              IMAGEPATH: null,
              IMAGEAPP: null,
              APPROVAL: 'T',
              CREATEDON: null,
              DEVICETOKEN: null,
              DOB: null,
              TYPE: 'IOS'
            }
          ] })
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
})

app.post(`/${version}/api/iosresigist`, async (req, res) => {
    try {
        console.log(req.body)
        const result = await Mobdetails.iosResigistinsertData(req.body)
         res.send(result)
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
})

// token();





