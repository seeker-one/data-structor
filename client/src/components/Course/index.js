import React from 'react'
import {withRouter} from 'react-router-dom'
import { Collapse, Icon,List,Avatar } from 'antd';
import URL from '@/utils/url'
import axios from '@/utils/axios'
import './style.less'

import Study from './study'
const Panel = Collapse.Panel;


class Course extends React.Component {
  constructor(props){
    super(props)
    this.state={
      directoryData:[],
      isStudy:false,
      studyCourseId:-1,
      parentId:-1,
    }
  }
  
  getDirectory(){
    axios.get(URL.getDirectory).then(res => {
      this.setState({
        directoryData: res.data
      })
    })
  }

  changeStudyStatus(status){
    this.setState({
      isStudy:status
    })
  }
  
  goCourseInfo(pId,id){
    this.setState({
      parentId:pId,
      studyCourseId:id,
      isStudy:true
    })
  }

  componentDidMount(){
    this.getDirectory()
  }

  render(){

    const customPanelStyle = {
      background: '#f7f7f7',
      borderRadius: 4,
      marginBottom: 24,
      border: 0,
      overflow: 'hidden',
    };

    return(
      <div>
        {!this.state.isStudy && 
          <Collapse
            bordered={false}
            defaultActiveKey={['0']}
            expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
          >
          {
            this.state.directoryData.map((d,index)=>{
              return(
                <Panel header={d.title} key={index} style={customPanelStyle}>
                <List
                    itemLayout="horizontal"
                    dataSource={d.children}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon="book" size="small"  style={{ backgroundColor: '#169866' }}/>}
                          title={<p>
                              <span className="sectionTitle" onClick={()=>this.goCourseInfo(d.id, item.id)}>{item.title}</span>
                              <span className="operation"> 
                                <Icon type="video-camera" style={{ color: '#169866' }} className='icon'/>
                                <Icon type="file" style={{ color: '#169866' }} className='icon'/>
                                <Icon type="message" style={{ color: '#169866' }} className='icon'/>
                              </span>
                            
                          </p>}
                        />
                      </List.Item>
                    )}
                  />
                </Panel>
              )
            })
          }
          </Collapse>
        }
        {
          this.state.isStudy && 
          <Study 
          changeStudyStatus={(v)=>this.changeStudyStatus(v)} 
          studyCourseId={this.state.studyCourseId}
          parentId={this.state.parentId}
          />
        }
      </div>
    )
  }
 }

export default withRouter(Course)