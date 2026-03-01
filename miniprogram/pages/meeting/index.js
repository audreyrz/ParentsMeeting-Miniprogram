import CustomPage from '../../components/CustomPage'

CustomPage({
  data: {
    // 从本地存储中获取用户信息
    userInfo : JSON.parse(wx.getStorageSync('userInfo')),
    joinMeeting:wx.getStorageSync('notParticipating')==true?0:1,//是否参加家长会 1为可以 0 为不可以
    tabs: [],
    timeList: [],
    selectedTimeIndex: -1,  //当前选择班主任时间 初始值为-1表示未选择任何时间段
    homeroomTeacherInfo:{},//班主任信息
    activeTab: 0,
    appointmentForHomeroom_id:null,//当前学生预约班主任时段记录的id
    currentTime:null,//当前选择班主任时间
    selectedTeacherList: [], //已选教师列表
    confirmTeacherListText:"",//已选老师确认文案
    show: false,
  },
  onLoad() {

    //获取班主任信息
  this.getHomeroomTeacherInfo();
  //获取预约信息时间段
  this.getHomeroomAppoinmentInfoById();
  //获取科目老师列表
  this.getTeacherList()
  },
  onShow(){
    this.setData({
      "joinMeeting":wx.getStorageSync('notParticipating')==true?0:1
    })
  },
  //获取班主任信息
  getHomeroomTeacherInfo(){
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getHomeroomTeacherInfoById',
        form: this.data.userInfo
      }
    }).then((resp) => {
      let data = resp.result.data
      if(data.length>0){
        this.setData({
          "homeroomTeacherInfo":data[0]
        })
        //预约时间是固定的
        const timeList = [{"index":"0","time":"13:00","leftPerson":0},
          {"index":"1","time":"13:30","leftPerson":0},
          {"index":"2","time":"14:00","leftPerson":0},
          {"index":"3","time":"14:30","leftPerson":0},
          {"index":"4","time":"15:00","leftPerson":0},
          {"index":"5","time":"15:30","leftPerson":0}
        ];
        let available = data[0].available //获取数据库班主任预约情况
        timeList.forEach((item,index)=>{ //遍历赋值
          item.leftPerson = available[index]
        })
        this.setData({timeList})
      }
    })
},
//获取班主任时间段预约信息
getHomeroomAppoinmentInfoById(){
  wx.cloud.callFunction({
    name: 'quickstartFunctions',
    data: {
      type: 'getHomeroomAppoinmentInfoById',
      form: {
        studentId: this.data.userInfo.studentId
      }
    }
  }).then((resp) => {
    let data = resp.result.data
    if(data.length>0){
      this.setData({
        "selectedTimeIndex":data[0].appointment_index,
        "currentTime":data[0].appointment_time,
        "appointmentForHomeroom_id":data[0]._id
      })
    }
  })
},
//获取预约科目老师信息
getAppoinmentInfoById(){
  wx.cloud.callFunction({
    name: 'quickstartFunctions',
    data: {
      type: 'getAppoinmentInfoById',
      form: {
        studentId: this.data.userInfo.studentId
      }
    }
  }).then((resp) => {
    let data = resp.result.data
    if(data.length>0){
      let appointmentList = data
      let selectedTeacherList = []
      // 找到对应老师并更新状态为未选中
    const tabs = this.data.tabs;
    tabs.forEach(tab => {
      if (tab.teacherList) { // 确保该选项卡有老师列表
        tab.teacherList.forEach(teacher => {
          appointmentList.forEach(appointment => {
            if (teacher.id === appointment.teacher_id) {
              teacher.active = true; // 将对应老师的状态设为选中
              teacher.appoinmentId = appointment._id //将预约id填充
              teacher.subject = tab.title //将科目名称填充
              selectedTeacherList.push(teacher) //将老师信息填充到已选列表里
            }
          });
        });
      }
    });
    //拼接已选科目，暂时不使用
    let confirmText = selectedTeacherList.map((teacher,index)=>{
      return `${index + 1}. ${teacher.subject} - ${teacher.name}\n`;
    }).join('')
    this.setData({
      tabs: tabs,
      selectedTeacherList: selectedTeacherList,
      confirmTeacherListText:confirmText
    });
    }
  })
},
//获取科目老师列表
getTeacherList(){
  wx.cloud.callFunction({
    name: 'quickstartFunctions',
    data: {
      type: 'getTeacherList'
    }
  }).then((resp) => {
    let data = resp.result.data
    if(data.length>0){
      this.setData({
        "tabs":data
      })
      this.getAppoinmentInfoById()//设置已选科目
    }
  })
},
  //选择预约班主任时间段 使用了异步操作async和await组合，防止人数加减错乱
 chooseTime(event){
    let isFull = event.currentTarget.dataset.full //是否满员 0为满员
    const index = parseInt(event.currentTarget.dataset.index);
    const currentTime = event.currentTarget.dataset.time;
    const { selectedTimeIndex } = this.data;
    if(isFull){
      if (selectedTimeIndex === index) {
        // 如果已经选中了当前时间段，则不做任何操作
      } else {
        // 如果有上一条时间段，则进行加1操作，并取消之前选中的时间段
        // if (selectedTimeIndex !== -1) {
        //   await this.updateTimeSlot(selectedTimeIndex, 1, currentTime);
        //   //await 异步 等待上面操作完成后，再进行后面的操作
        //   //返回updateTimeSlot方法内return new Promise 的 resolve 则表示上面操作完成了
        // }
        this.updateTimeSlot(index, currentTime);
      }
    }else{
      wx.showToast({
        title: '该时段已约满，请选择其他时段',
        icon: 'none'
      });
    }
    
  },
  //更新时段人数
  updateTimeSlot(index,  time) {
      wx.showLoading({
        title: '预约中',
      })
      wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'appoinmentForHomeroom',
          form: {
            _id: this.data.homeroomTeacherInfo._id,
            indexItem: {
              "selectedTimeIndex":this.data.selectedTimeIndex,
              "currentTimeIndex":index
            }
          }
        }
      }).then((res)=>{
        let result = res.result
        if (result.code == 200) {
          // 更新成功，更新页面状态
            //删除一条预约记录
            if(this.data.selectedTimeIndex!=-1){ //如果有已选时间段
              this.deleteAppoinmentRecordForHomeroom()
            }
            //创建新增
            this.setData({
              selectedTimeIndex:  index, 
              currentTime: time
            });
            //更新时段信息
            this.getHomeroomTeacherInfo();
            //创建一条预约记录
            this.createAppoinmentRecordForHomeroom()
            wx.showToast({
              title: '预约时段成功',
              icon: 'success'
            });
        } else {
          // 更新失败，提示用户或进行其他处理
          wx.showToast({
            title: '预约时段失败',
            icon: 'error'
          });
          //重新更新时段列表
          this.getHomeroomTeacherInfo()
        }
        wx.hideLoading()
      }).catch((error) => {
        console.error('调用云函数失败：', error);
        wx.hideLoading()
      });
  },
  //创建一条预约记录 - 班主任
  createAppoinmentRecordForHomeroom(){
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'createAppoinmentRecordForHomeroom',
        form: {
          appointment_time: this.data.currentTime,
          student_id: this.data.userInfo.studentId,
          student_name: this.data.userInfo.studentName,
          teacher_id: this.data.homeroomTeacherInfo._id,
          teacher_name: this.data.homeroomTeacherInfo.name,
          appointment_index: this.data.selectedTimeIndex
        }
      },
      success: res => {
        console.log('预约成功', res);
          this.setData({
            "appointmentForHomeroom_id":res.result._id
          })
      },
      fail: err => {
        console.error('预约失败', err);
      }
    });
  },
  //删除一条预约记录 - 班主任
  deleteAppoinmentRecordForHomeroom(){
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data:{
        type:"deleteAppoinmentRecordForHomeroom",
        form: {
          _id: this.data.appointmentForHomeroom_id
        }
      },
      success: res => {
        console.log('取消预约成功', res);
      },
      fail: err => {
        console.error('取消预约失败', err);
      }
    });
  },
   //创建一条预约记录 - 科目
   createAppoinmentRecord(teacher,subject){
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'createAppoinmentRecord',
        form: {
          student_id: this.data.userInfo.studentId,
          student_name: this.data.userInfo.studentName,
          teacher_id: teacher.id,
          teacher_name: teacher.name,
          subject: subject
        }
      },
      success: res => {
        console.log('预约成功', res);
        wx.showToast({
          title: '预约科目成功',
          icon: 'success'
        });
        //补充appoinmentId到selectedTeacherList对应选项里，用于删除时，删除对应预约记录
        let selectedTeacherList = this.data.selectedTeacherList
        const targetIndex = selectedTeacherList.findIndex(item => item.id === teacher.id);
        // 如果找到了指定id的一行
        if (targetIndex !== -1) {
          // 增加appoinmentId属性
          const appoinmentId = res.result._id; // 替换成你要增加的appoinmentId
          selectedTeacherList[targetIndex].appoinmentId = appoinmentId;
          this.setData({
            "selectedTeacherList":selectedTeacherList
          })
        }
          
      },
      fail: err => {
        console.error('预约失败', err);
      }
    });
  },
  //删除一条预约记录 - 科目
  deleteAppoinmentRecord(appoinmentId){

    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data:{
        type:"deleteAppoinmentRecord",
        form: {
          _id: appoinmentId
        }
      },
      success: res => {
        console.log('取消预约成功', res);
      },
      fail: err => {
        console.error('取消预约失败', err);
      }
    });
  },
  chooseTeacher:function(event){
    var parentindex = event.currentTarget.dataset.parentindex;//外层科目index
    var index = event.currentTarget.dataset.index;//内部老师index
    var id = event.currentTarget.dataset.id;//内部老师id
    var subject = {"subject":this.data.tabs[parentindex].title};
    var teacherList = this.data.tabs[parentindex].teacherList;
    teacherList[index].active = !teacherList[index].active;//改变选中状态
    this.setData({
      ['tabs[' + parentindex + '].teacherList'] : teacherList
    });
    var selectedTeacher = teacherList[index];
    var mergedObject = Object.assign({}, selectedTeacher, subject);
    var selectedTeacherList = null;
    if (teacherList[index].active) { //选中学科老师
      selectedTeacherList = this.data.selectedTeacherList.concat(mergedObject);
      this.createAppoinmentRecord(selectedTeacher,subject.subject)//创建一条预约数据
    }else{//取消学科老师
      const targetIndex = this.data.selectedTeacherList.findIndex(item => item.id === selectedTeacher.id);
      this.deleteAppoinmentRecord(this.data.selectedTeacherList[targetIndex].appoinmentId) //删除指定预约数据
      selectedTeacherList = this.data.selectedTeacherList.filter(
        teacher => !(selectedTeacher.id === teacher.id)
      );
    }
    let confirmText = selectedTeacherList.map((teacher,index)=>{
      return `${index + 1}. ${teacher.subject} - ${teacher.name}\n`;
    }).join('')
    this.setData({
      selectedTeacherList: selectedTeacherList,
      confirmTeacherListText:confirmText
    });
  },
  removeTeacher: function(event) {
    var index = event.currentTarget.dataset.index;
    var id = event.currentTarget.dataset.id;
    var selectedTeacherList = this.data.selectedTeacherList;
    const targetIndex = this.data.selectedTeacherList.findIndex(item => item.id === id);
    this.deleteAppoinmentRecord(this.data.selectedTeacherList[targetIndex].appoinmentId) //删除指定数据
    const removedTeacher = selectedTeacherList.splice(index, 1)[0]; // 删除已选老师
    // 找到对应老师并更新状态为未选中
    const tabs = this.data.tabs;
    tabs.forEach(tab => {
      if (tab.teacherList) { // 确保该选项卡有老师列表
        tab.teacherList.forEach(teacher => {
          if (teacher.id === removedTeacher.id) {
            teacher.active = false; // 将对应老师的状态设为未选中
          }
        });
      }
    });
    this.setData({
      tabs: tabs,
      selectedTeacherList: selectedTeacherList
    });
  },
  onTabClick(e) {
    const index = e.detail.index
    this.setData({
      activeTab: index
    })
  },
  radioChange(e) {
    this.setData({
      joinMeeting: e.detail.value
    })
    if(e.detail.value==1){ //如果由不参加改为参加，则删除不参加的那条预约记录
      let appointmentForHomeroom_id = wx.getStorageSync('notParticipatingId')
      if(appointmentForHomeroom_id){
        this.setData({
          "appointmentForHomeroom_id":appointmentForHomeroom_id
        })
        this.deleteAppoinmentRecordForHomeroom()
        wx.setStorageSync('notParticipating', false);
        wx.setStorageSync('notParticipatingId', "");
      }
    }
  },
  onChange(e) {
    const index = e.detail.index
    this.setData({
      activeTab: index
    })
  },
  open: function () {
    wx.navigateBack({
      delta: 1, // 回退的页面数，这里表示回退一页，可以根据需要调整
    });
    // this.setData({
    //     show: true
    // })
},
submit: function () {
  wx.cloud.callFunction({
    name: 'quickstartFunctions',
    data: {
      type: 'createAppoinmentRecordForHomeroom',
      form: {
        appointment_time: "不参加",
        student_id: this.data.userInfo.studentId,
        student_name: this.data.userInfo.studentName,
        teacher_id: this.data.homeroomTeacherInfo._id,
        teacher_name: this.data.homeroomTeacherInfo.name,
        appointment_index: -1
      }
    },
    success: res => {
      console.log('预约成功', res);
      wx.navigateBack({
        delta: 1, // 回退的页面数，这里表示回退一页，可以根据需要调整
      });
    },
    fail: err => {
      console.error('预约失败', err);
    }
  });
    
    // this.setData({
    //     show: true
    // })
},

buttontap(e) {
    if(e.detail.index==1){
      wx.navigateTo({
        url: '/pages/school/index',
      })
    }else{
      this.setData({
        show: false
    })
    }
},
  handleClick() {
    wx.navigateTo({
      url: './webview',
    })
  }
})
