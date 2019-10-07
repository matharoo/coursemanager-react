import React from 'react';
import { Button } from 'reactstrap';
//Dynamic row component which accepts all the object props and also recieves headers and then displays based on headers values.. so JSON can have as many properties inside the object. It will work fine as long as we have Object Array like sample-log file.
const Row = (props) => {
    return (
        <tr key={props.rowData.index}>
            <th scope="row">{props.rowData.sid}</th>
            <td>{props.rowData.name}</td>
            <td className={props.rowData.asgn1<80 ? 'bg-danger text-white':null}>{props.rowData.asgn1}</td>
            <td className={props.rowData.asgn2<80 ? 'bg-danger text-white':null}>{props.rowData.asgn2}</td>
            <td className={props.rowData.test1<80 ? 'bg-danger text-white':null}>{props.rowData.test1}</td>
            <td className={props.rowData.test2<80 ? 'bg-danger text-white':null}>{props.rowData.test2}</td>
            <td className={props.rowData.attnd<95 ? 'bg-danger text-white':null}>{props.rowData.attnd}</td>
            <td>{props.rowData.grade}</td>
            <td className={props.rowData.pass ? 'bg-success text-white' : 'bg-danger text-white'}>{props.rowData.pass ? 'Pass' : 'Fail'}</td>
            <td><Button color="secondary" onClick={(e)=>props.editMode(e,props.rowData)} name='edit'>Edit</Button>{' '}<Button color="close bg-danger text-white" onClick={()=>props.handleDelete(props.id)}><span aria-hidden="true">&times;</span></Button></td>
            <td></td>
      </tr>
    );
}

export default Row;