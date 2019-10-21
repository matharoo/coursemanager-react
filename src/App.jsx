import React, { useEffect, useState } from 'react';
import {
  Button, Table, Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import Row from './components/Row';
import db from './db';


const App = () => {
  const [newgrade, setNewgrade] = useState({
    sid: '', name: '', asgn1: '', asgn2: '', test1: '', test2: '', attnd: '',
  });
  const [weights, setWeights] = useState({});
  const [marks, setMarks] = useState([]);
  const [editmode, setEditmode] = useState(false);
  const [gradeModal, setGradeModal] = useState(false);
  const [weightModal, setWeightModal] = useState(false);
  const [filter, setFilter] = useState('');
  /**
   * Initilization function for populating lists by querying the db
   */
  useEffect(
    () => {
      // read from the tables course and weights and populate into state lists
      db.transaction('r', db.table('course'), async () => {
        await db.table('course')
          .toArray()
          .then((marks) => {
            setMarks(marks);
          });
      }).catch((e) => {
        console.log(e.stack || e);
      });
    }, [], // this ensure the lists are updated whenever database updates
  );

  /**
   * Listens to form inputs on the forms and updates the states
   * @param {*} e listens for stat0e changes for inputs when adding grades and weights
   * @param {*} mode there are two modes; grades & weights which allows the
   * function to listen to different form inputs and update the states marks & weights respectively
   */
  const handleChange = (e, mode) => {
    const field = e.target.name;
    let val = e.target.value;
    if (field !== 'name') {
      if (val.length > e.target.maxLength) {
        val = val.slice(0, e.target.maxLength);
      }
    } else {
      val = val.replace(/[^A-z\s]/g, '');
    }
    if (mode === 'grades') {
      setNewgrade((prevState) => ({ ...prevState, [field]: val }));
    } else if (mode === 'weights') {
      setWeights((prevState) => ({ ...prevState, [field]: parseInt(val) }));
    }
  };

  /**
   * Function to load weights from weights table in the db
   */
  const loadWeights = () => {
    db.transaction('r', db.table('weights'), async () => {
      await db.table('weights')
        .toArray()
        .then((wts) => {
          if (wts.length === 1) {
            setWeights(wts[0]);
          }
        });
    }).catch((e) => {
      console.log(e.stack || e);
    });
  };

  /**
   * Hides or shows grades modal form
   * @param {*} e Listens to the form input events and hides and shows the
   * grades modal for adding or editing modes
   */
  const toggleAddModal = (e) => {
    if (Object.entries(weights).length === 0 && weights.constructor === Object) {
      loadWeights();
    }
    const mode = e.target.name;
    if (mode === 'edit') {
      setEditmode(true);
      setGradeModal(true);
    } else if (mode === 'add') {
      setNewgrade({
        sid: '', name: '', asgn1: '', asgn2: '', test1: '', test2: '', attnd: '',
      });
      setGradeModal(true);
      setEditmode(false);
    } else if (mode === 'undefined') {
      setGradeModal(false);
    } else if (mode === '') {
      setGradeModal(false);
    }
  };

  /**
   * Hides or shows weights modal form
   * @param {*} e Listens to the form input events and hides and shows
   * the weights modal for updating the weights
   */
  const toggleWeightModal = (e) => {
    setWeights({
      asgn1: 20, asgn2: 20, test1: 30, test2: 30,
    });
    if (weightModal) setWeightModal(false);
    else setWeightModal(true);
  };

  /**
   * Helper function to switch the grade form to edit mode
   * @param {*} e listens to the event from edit or add button and passes it to
   * the toggle grade modal func
   * @param {*} data recieves the grades data object for current student
   * and assigns it to newgrade state for updating the current student record
   */
  const editMode = (e, data) => {
    Object.keys(data).map((value) => newgrade[value] = data[value]);
    toggleAddModal(e);
  };

  /**
   * Populates the assignment and test weights into the weights table..
   * default values are {asgn1:20, asgn2:20, test1:30, test2:30}
   */
  const updateWeights = () => {
    db.transaction('rw', db.table('weights'), async () => {
      await db.table('weights').clear()
        .then(() => {
          db.transaction('rw', db.table('weights'), async () => {
            await db.table('weights').add(weights)
              .then((id) => {
                setWeights(weights);
                setWeightModal(false);
              })
              .catch((e) => {
                console.log(e.stack || e);
              });
          });
        });
    });
  };

  /**
   * DB func for Adding Grades marks for a student to the course table
   */
  const addGrade = () => {
    const mark = calculateAverage(newgrade);
    db.transaction('rw', db.table('course'), async () => {
      await db.table('course').add(mark)
        .then((id) => {
          const newList = [...marks, { ...mark, id }];
          setMarks(newList);
          setGradeModal(false);
        })
        .catch((e) => {
        // log any errors
          console.log(e.stack || e);
        });
    });
  };

  /**
   * Updates the course table with updated fields
   */
  const handleUpdate = () => {
    const mark = calculateAverage(newgrade);
    db.transaction('rw', db.table('course'), async () => {
      await db.table('course')
        .update(mark.id, mark)
        .then((updated) => {
          if (updated === 1) {
            setMarks(marks.map((item) => {
              if (item.id !== mark.id) return item;
              return mark;
            }));
            setGradeModal(false);
          }
        })
        .catch((e) => {
          console.log(e.stack || e);
        });
    });
  };

  /**
   * Handles the delete row functionality
   * @param {*} id deletes the selected student record based on the id
   */
  const handleDelete = (id) => {
    db.transaction('rw', db.table('course'), async () => {
      await db.table('course')
        .delete(id)
        .then(() => {
          const newList = marks.filter((mark) => mark.id !== id);
          setMarks(newList);
        })
        .catch((e) => {
        // log any errors
          console.log(e.stack || e);
        });
    });
  };

  /**
   * Calculates the overall grade and result to show pass & fail depending on the scores
   * grade =((Assignment 1 weight /100)x students Assignment 1 score) +
   * (Assignment 2 weight /100) x students Assignment 2 score)) +
   * ((Test 1 weight/100)*students Test 1 score) +
   * (Tetst 2 weight /100) x students Test 2 score))
   * overall result = PASS if both assignmentpercents > 80 and testspercent > 80 && attendance >= 95
   * @param {*} data the current student grade object
   */
  const calculateAverage = (data) => {
    const assignmentweights = weights.asgn1 + weights.asgn2;
    const totalassignmentscore = ((weights.asgn1 / 100) * data.asgn1) + ((weights.asgn2 / 100) * data.asgn2);
    const assignmentspercent = (totalassignmentscore / assignmentweights) * 100;
    const testweights = weights.test1 + weights.test2;
    const totaltestscore = ((weights.test1 / 100) * data.test1) + ((weights.test2 / 100) * data.test2);
    const testspercent = (totaltestscore / testweights) * 100;
    const grade = totalassignmentscore + totaltestscore;
    data.grade = parseFloat(grade).toFixed(2);
    if (assignmentspercent >= 80 && testspercent >= 80 && data.attnd >= 95) {
      data.pass = true;
    } else {
      data.pass = false;
    }
    return data;
  };

  /**
   * Function to update the filter state connected with input
   * @param {*} e filter input event handler
   */
  const filterRecords = (e) => {
    setFilter(e.target.value);
    console.log(e.target.value);
  };

  /**
   * Filtered marks changes based on input in search filter
   * Matches the input with all the column values and if match is found is added
   * to the filtered array
   */
  const filtered = marks.filter((mark) => Object.keys(mark).some((key) =>
  // convert the comparisons to lowercase to avoid case sensitivite chars
    mark[key].toString().toLowerCase().includes(filter.toLowerCase())));

  /**
   * comparison function for sorting the values based on key and mode
   */
  const comparison = (key, mode) => ((a, b) => {
    if (mode === 'asc') {
      if (a[key] < b[key]) return -1;
      if (a[key] > b[key]) return 1;
      return 0;
    }
    if (a[key] > b[key]) return -1;
    if (a[key] < b[key]) return 1;
    return 0;
  });

  /**
   * Sort function to sort the table based on header key and mode (ascending/descending)
   * @param {*} key the column key based on which the list will be sorted
   * @param {*} mode sorting in descending or ascending mode
   */
  const sort = (key, mode) => {
    const newarr = [...marks];
    newarr.sort(comparison(key.header, mode));
    setMarks(newarr);
  };

  return (
    <div className="App">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <h2>Course Manager</h2>
          </div>
        </div>
        <div className="row">
          { Object.keys(marks).length !== 0 || Object.keys(weights).length !== 0
            ? (
              <div className="col-md-10">
                <div className="row">
                  <div className="col-md-4 mt-2 mb-2">
                    <input className="form-control" value={filter} onChange={(e) => filterRecords(e)} placeholder="Search or filter records" name="filter" />
                  </div>
                  <div className="col mt-2 mb-2 text-right">
                    <Button color="primary" onClick={toggleAddModal} name="add">Add Grade</Button>
                  </div>
                </div>
              </div>
            ) : null}
          <div className="col mt-2 mb-2 text-right">
            <Button color="primary" onClick={toggleWeightModal} name="add">Adjust Weights</Button>
          </div>
        </div>
        <div className="col-md-12">
          {
            Object.keys(marks).length !== 0 ? (
              <Table>
                <thead>
                  <tr>
                    {
                      Object.keys(marks[0]).filter((header) => header !== 'id').map((header) => (
                        <th key={header} name={header} scope="col" data-sort="header">
                          <u>{header}</u>
                          <span className="fa fa-stack">
                            <FontAwesomeIcon icon={faCaretUp} onClick={() => sort({ header }, 'asc')} />
                            <FontAwesomeIcon icon={faCaretDown} onClick={() => sort({ header }, 'desc')} />
                          </span>
                        </th>
                      ))
                      }
                  </tr>
                </thead>
                <tbody>
                  {
                filtered.map((rowData, index) => (
                  <Row
                    key={rowData.id}
                    rowData={rowData}
                    editMode={editMode}
                    handleDelete={handleDelete}
                  />
                ))
                }
                </tbody>
              </Table>
            ) : (
              <div className="alert alert-warning" role="alert">
                No grades have been added!
              </div>
            )
          }
        </div>
      </div>
      <Modal isOpen={gradeModal} toggle={toggleAddModal} className="modal-dialog">
        <ModalHeader>Grade Form</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Input type="number" value={newgrade.sid} onChange={(e) => handleChange(e, 'grades')} name="sid" id="sid" placeholder="Student ID" maxLength="7" />
          </FormGroup>
          <FormGroup>
            <Input type="text" value={newgrade.name} onChange={(e) => handleChange(e, 'grades')} name="name" id="name" placeholder="Student Name" />
          </FormGroup>
          <FormGroup>
            <Input type="number" value={newgrade.asgn1} onChange={(e) => handleChange(e, 'grades')} name="asgn1" id="asgn1" placeholder="Assignment 1" min="1" max="100" maxLength="3" />
          </FormGroup>
          <FormGroup>
            <Input type="number" value={newgrade.asgn2} onChange={(e) => handleChange(e, 'grades')} name="asgn2" id="asgn2" placeholder="Assignment 2" min="1" max="100" maxLength="3" />
          </FormGroup>
          <FormGroup>
            <Input type="number" value={newgrade.test1} onChange={(e) => handleChange(e, 'grades')} name="test1" id="test1" placeholder="Test 1" min="1" max="100" maxLength="3" />
          </FormGroup>
          <FormGroup>
            <Input type="number" value={newgrade.test2} onChange={(e) => handleChange(e, 'grades')} name="test2" id="test2" placeholder="Test 2" min="1" max="100" maxLength="3" />
          </FormGroup>
          <FormGroup>
            <Input type="number" value={newgrade.attnd} onChange={(e) => handleChange(e, 'grades')} name="attnd" id="attnd" placeholder="Attendance" min="1" max="100" maxLength="3" />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          {!editmode
            ? <Button color="primary" onClick={addGrade}>Add Marks</Button>
            : <Button color="primary" onClick={handleUpdate}>Edit</Button>}
          {' '}
          <Button color="secondary" onClick={toggleAddModal}>Cancel</Button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={weightModal} toggle={toggleWeightModal} className="modal-dialog">
        <ModalHeader>Weights for Assignments and Tests</ModalHeader>
        <ModalBody>
          <FormGroup>
            <label htmlFor="asgn1">Assignment 1</label>
            <Input type="number" value={weights.asgn1} onChange={(e) => handleChange(e, 'weights')} name="asgn1" id="asgn1" placeholder="Assignment 1" min="1" max="100" maxLength="3" />
          </FormGroup>
          <FormGroup>
            <label htmlFor="asgn2">Assignment 2</label>
            <Input type="text" value={weights.asgn2} onChange={(e) => handleChange(e, 'weights')} name="asgn2" id="asgn2" placeholder="Assignment 2" min="1" max="100" maxLength="3" />
          </FormGroup>
          <FormGroup>
            <label htmlFor="test1">Test 1</label>
            <Input type="number" value={weights.test1} onChange={(e) => handleChange(e, 'weights')} name="test1" id="test1" placeholder="Test 1" min="1" max="100" maxLength="3" />
          </FormGroup>
          <FormGroup>
            <label htmlFor="test2">Test 2</label>
            <Input type="number" value={weights.test2} onChange={(e) => handleChange(e, 'weights')} name="test2" id="test2" placeholder="Test 2" min="1" max="100" maxLength="3" />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          {!editmode
            ? <Button color="primary" onClick={updateWeights}>Update Weights</Button>
            : <Button color="primary" onClick={handleUpdate}>Edit</Button>}
          {' '}
          <Button color="secondary" onClick={toggleWeightModal}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default App;
