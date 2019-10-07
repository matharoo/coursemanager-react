import React, { useEffect, useState } from 'react';
import db from './db';
import { Button, Table, Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label } from 'reactstrap';
import Row from './components/Row';

const App = () => {
  const [id, setId] = useState('');
  const [newmark, setNewmark] = useState({sid:'','name':'',asgn1:'',asgn2:'',test1:'',test2:'',attnd:''})
  const [marks,setMarks] = useState([]);
  const [weights,setWeights] = useState({});
  const [editmode,setEditmode] = useState(false);
  const [addModal, setAddModal] = useState(false)
  // const [dbFirstname, setLoading] = useState(true);
  // const [mounted, setMounted] = useState(false);
  useEffect(
    () => {
      // console.log("state of new name: "+newname);
      // create the store
      console.log("doing something to db :"+addModal);

      db.transaction('r', db.table('course'), async () => {
        console.log("going to read grades from course");
        // if the first or last name fields have not be added, add them
        await db.table('course')
        .toArray()
        .then((marks) => {
          setMarks(marks);
        });
      }).catch(e => {
        // log any errors
        console.log(e.stack || e)
      })

      db.transaction('r', db.table('weights'), async () => {
        console.log("going to read weights");
        // if the first or last name fields have not be added, add them
        await db.table('weights')
        .toArray()
        .then((wts) => {
          setWeights(wts[0]);
        });
      }).catch(e => {
        // log any errors
        console.log(e.stack || e)
      })
  
    },
    // run effect whenever the database connection changes
    []
  )

  const addWeights = () =>{
    const wts = { asgn1:20, asgn2:20, test1:30, test2:30 }
    console.log("adding weights"+JSON.stringify(wts));
    db.transaction('rw', db.table('weights'), async () => {
      await db.table('weights').add(wts)
      .then((id) => {
        setWeights(wts)
      })
      .catch(e => {
        // log any errors
        console.log(e.stack || e)
      })
    })
  }

  const handleChange = (e) => {
    console.log("changing state for "+e.target.name)
    const name = e.target.name;
    const value = e.target.value;
    setNewmark(prevState => {
      return { ...prevState, [name]: value }
    });
  }

  const toggleAddModal = (e) => {
    console.log('adding mode: '+e.target.name);
    switch (e.target.name) {
      case 'edit': {
        console.log('edit mode '+e.target.name);
        setEditmode(true);
        setAddModal(true);
        break;
      }
      case 'add': {
        setNewmark({sid:'',name:'',asgn1:'',asgn2:'',test1:'',test2:'',attnd:''})
        setAddModal(true)
        setEditmode(false);
        break;
      }
      case 'undefined':{
        setAddModal(false);
        break;
      }
      case '':{
        setAddModal(false);
        break;
      }
    }
  }

  const addMark = () => {
    const mark = calculateAverage(newmark);
    db.transaction('rw', db.table('course'), async () => {
      await db.table('course').add(mark)
      .then((id) => {
        const newList = [...marks, Object.assign({}, mark, { id })];
        setMarks(newList)
        setAddModal(false);
      })
      .catch(e => {
        // log any errors
        console.log(e.stack || e)
      })
    })
  }

  const editMode = (e,data) => {
    console.log("editing row"+JSON.stringify(data));
      Object.keys(data).map((value)=>{
        newmark[value] = data[value]
      })
      toggleAddModal(e);
  }

  const handleUpdate = () => {
    console.log("record to be updated will be :"+newmark.id);
    console.log("all marks before update is "+JSON.stringify(marks))
    const mark = calculateAverage(newmark);
    console.log("Mark is: "+JSON.stringify(mark.id));
    db.transaction('rw', db.table('course'), async () => {
      await db.table('course')
      .update(mark.id,mark)
      .then((updated) => {
        if(updated===1){
          setMarks(marks.map(function (item) {
            if (item.id !== mark.id) return item;
            return mark;
          }))
          setAddModal(false);
        }
      })
      .catch(e => {
        // log any errors
        console.log(e.stack || e)
      })
    })
  }

  const handleDelete = (id) => {
    console.log("deleting id: "+id);
    db.transaction('rw', db.table('course'), async () => {
      await db.table('course')
      .delete(id)
      .then(() => {
        const newList = marks.filter((mark) => mark.id !== id);
        setMarks(newList)
      })
      .catch(e => {
        // log any errors
        console.log(e.stack || e)
      })
    })
  }

  const calculateAverage = (data) =>{
    console.log('Calculating Avg: '+data)
    const assignmentweights = weights.asgn1+weights.asgn2
    const totalassignmentscore = ((weights.asgn1/100)*data.asgn1) + ((weights.asgn2/100)*data.asgn2)
    const assignmentspercent = (totalassignmentscore/assignmentweights)*100
    const testweights = weights.test1 +weights.test2
    const totaltestscore = ((weights.test1/100)*data.test1) + ((weights.test2/100)*data.test2) 
    const testspercent = (totaltestscore/testweights)*100
    const grade = totalassignmentscore + totaltestscore
    console.log("grade is "+grade);
    data['grade'] = (parseFloat(grade).toFixed(2)).toString();
    if(assignmentspercent > 80 && testspercent > 80 && data.attnd >= 95){
      data.pass = true
    }
    else{
      data.pass = false
    }
    return data;
  }
  
  return (
    <div className="App">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <h2>Course Manager</h2>
          </div>
          <div className="col-md-12 text-right">
            <Button color="primary" onClick={toggleAddModal} name='add'>Add Grade</Button>{' '}
            <Button color="primary" onClick={addWeights} name='add'>Add Weights</Button>
          </div>
          <div className="col-md-12">
          {
            marks.length > 0 ? (
              <Table>
                <thead>
                  <tr>
                      {
                      Object.keys(marks[0]).filter((header)=>{
                        return header!='id'
                      }).map((header) => <th key={header} scope="col"><u>{header}</u></th>)
                      }
                  </tr>
                </thead>
                <tbody>
                {
                marks.map((rowData,index)=>
                  <Row key={rowData.id} rowData={rowData} editMode={editMode} handleDelete={handleDelete} />
                )
                }
                </tbody>
              </Table>
            ):(null)
          }
          </div>
        </div>
      </div>
      <Modal isOpen={addModal} toggle={toggleAddModal} className="modal-dialog">
          <ModalHeader>Modal title</ModalHeader>
          <ModalBody>
            <FormGroup>
              <Input type="text" value={newmark.sid} onChange={handleChange} name="sid" id="sid" placeholder="Student ID" />
            </FormGroup>
            <FormGroup>
              <Input type="text" value={newmark.name} onChange={handleChange} name="name" id="name" placeholder="Student Name" />
            </FormGroup>
            <FormGroup>
              <Input type="text" value={newmark.asgn1} onChange={handleChange} name="asgn1" id="asgn1" placeholder="Assignment 1" />
            </FormGroup>
            <FormGroup>
              <Input type="text" value={newmark.asgn2} onChange={handleChange} name="asgn2" id="asgn2" placeholder="Assignment 2" />
            </FormGroup>
            <FormGroup>
              <Input type="text" value={newmark.test1} onChange={handleChange} name="test1" id="test1" placeholder="Test 1" />
            </FormGroup>
            <FormGroup>
              <Input type="text" value={newmark.test2} onChange={handleChange} name="test2" id="test2" placeholder="Test 2" />
            </FormGroup>
            <FormGroup>
              <Input type="text" value={newmark.attnd} onChange={handleChange} name="attnd" id="attnd" placeholder="Attendance" />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            {!editmode ?
            <Button color="primary" onClick={addMark}>Add Marks</Button>
            : <Button color="primary" onClick={handleUpdate}>Edit</Button>}
            {' '}
            <Button color="secondary" onClick={toggleAddModal}>Cancel</Button>
          </ModalFooter>
      </Modal>
    </div>
  );
}

export default App;
