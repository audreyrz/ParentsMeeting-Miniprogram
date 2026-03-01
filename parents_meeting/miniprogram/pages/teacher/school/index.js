// pages/teacher/school/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _id: '',
    teacherName: '',
    teacherId: '',
    homeroom_grade_id: '',
    openId: '',
    homeroomAppointment: [],
    subjectAppointment: []
  },

  getHomeroomAppointmentInfo () {
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'teacherGetHrAppointment',
        form: {
          teacherName: this.data.teacherName
        }
      }
    }).then((resp) => {
      let data = resp.result.data
      let list_temp = [];
      for (let i=0; i<data.length; i++) {
        list_temp.push({
          "studentName": data[i].student_name,
          "studentId": data[i].student_id,
          "appointmentTime": data[i].appointment_time
        })
      }
      this.setData({
        homeroomAppointment: list_temp
      })
    })
  },

  getSubjectAppointmentInfo () {
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'teacherGetSubjectAppointment',
        form: {
          teacherName: this.data.teacherName
        }
      }
    }).then((resp) => {
      let data = resp.result.data
      let list_temp = [];
      for (let i=0; i<data.length; i++) {
        list_temp.push({
          "studentName": data[i].student_name,
          "studentId": data[i].student_id,
          "subject": data[i].subject
        })
      }
      this.setData({
        subjectAppointment: list_temp
      })
    })
  },

  generateCSV (tableData) {  
    const fs = wx.getFileSystemManager();
    wx.showLoading({
        title: '正在生成',
    })
    let dataStr = "";
    let keys = Object.keys(tableData[0]);
    //标题
    for (let i = 0; i < keys.length; i++) {
        if (i != keys.length - 1) {
            dataStr += (keys[i] + ",")
        } else {
            dataStr += (keys[i] + "\n")
        }
    }
    //数据
    for (let i = 0; i < tableData.length; i++) {
        for (let j = 0; j < keys.length; j++) {
            if (j != keys.length - 1) {
                dataStr += (tableData[i][keys[j]] + ",")
            } else {
                dataStr += (tableData[i][keys[j]] + "\n")
            }
        }
    }
    wx.showLoading({
        title: '正在写入',
    })
    fs.writeFileSync(`${wx.env.USER_DATA_PATH}/appointments.csv`, dataStr, "utf-8")
    wx.hideLoading({
        success: (res) => {
            wx.showModal({
                title: '成功',
                content: '生成完成，是否分享',
                success(res) {
                    if (res.confirm) {
                        wx.shareFileMessage({
                            filePath: `${wx.env.USER_DATA_PATH}/appointments.csv`,
                            success() {
                            },
                            fail: console.error,
                        })
                    } else if (res.cancel) {
                    }
                }
            })
        },
    })    
  },

  generateHomeroomCSV () {
    this.generateCSV(this.data.homeroomAppointment);
  },

  generateSubjectCSV () {
    this.generateCSV(this.data.subjectAppointment);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const userData = JSON.parse(wx.getStorageSync('teacherInfo'));
    this.setData({
      "teacherName": userData.teacherName,
      "teacherId": userData.teacherId,
      "homeroomId": userData.homeroomId,
      "_id": userData._id 
    })
    this.getHomeroomAppointmentInfo();
    this.getSubjectAppointmentInfo();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})