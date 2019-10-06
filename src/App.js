import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import db from './db';
import { Button, Table, Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label } from 'reactstrap';

const App = () => {
  const [id, setId] = useState('');
  const [newmark, setNewmark] = useState({sid:'',name:'',asgn1:'',asgn2:'',test1:'',test2:'',attnd:''})
  const [marks,setMarks] = useState([]);
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
        console.log("going to read");
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
  
    },
    // run effect whenever the database connection changes
    []
  )

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
    db.transaction('rw', db.table('course'), async () => {
      await db.table('course').add(newmark)
      .then((id) => {
        const newList = [...marks, Object.assign({}, newmark, { id })];
        setMarks(newList)
      })
      .catch(e => {
        // log any errors
        console.log(e.stack || e)
      })
    })
  }

  const editMode = (e,data) => {
    console.log("editing row"+JSON.stringify(data));
      Object.keys(data).map((value,index)=>{
        newmark[value] = data[value]
      })
      toggleAddModal(e);
  }

  const handleUpdate = () => {
    console.log("record to be updated will be :"+id);
    db.transaction('rw', db.table('course'), async () => {
      await db.table('course')
      .update(id,newmark)
      .then((updated) => {
        console.log("updated is "+JSON.stringify(updated))
        const newList = marks.map(mark => (mark.id === id ? {...mark, newmark} : mark))
        console.log(newList)
        setMarks(newList)
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
  
  return (
    <div className="App">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <h2>Course Manager</h2>
          </div>
          <div className="col-md-12 text-right">
            <Button color="primary" onClick={toggleAddModal} name='add'>Add Grade</Button>
          </div>
          <div className="col-md-12">
              <Table>
                <thead>
                  <tr>
                  {
                      marks.length > 0 ? 
                      Object.keys(marks[0]).map((header) => <th key={header} scope="col"><u>{header}</u></th>) 
                        : 
                        null
                  }
                  </tr>
                </thead>
                <tbody>
                {
                marks.map((rowData, index) => 
                  <tr key={index}>
                    <th scope="row">{index+1}</th>
                    <td>{rowData.name}</td>
                    <td>{rowData.asgn1}</td>
                    <td>{rowData.asgn2}</td>
                    <td>{rowData.test1}</td>
                    <td>{rowData.test2}</td>
                    <td>{rowData.attnd}</td>
                    <td>{rowData.grade}</td>
                    <td><Button color="primary" onClick={(e)=>editMode(e,rowData)} name='edit'>Edit</Button>{' '}<Button color="danger" onClick={()=>handleDelete(rowData.id)}>Delete</Button></td>
                    <td></td>
                  </tr>
                )
                }
                </tbody>
              </Table>
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
