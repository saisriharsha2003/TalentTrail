import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { notify } from '../Toast';

const AdminSelected = () => {
    const [selected, setSelected] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    

    const axios = useAxiosPrivate();

    useEffect(() => {
        const fetchSelected = async () => {
            try {
                const response = await axios.get('/admin/selected');

                const selectedData = response?.data;
                setSelected(selectedData);
            } catch (err) {
                notify('failed', err?.response?.data?.message);
            }
        };
        fetchSelected();
    }, [axios]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredSelected = selected.filter((item) =>
        item?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item?.jobRole?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="card m-2 mx-5 my-4">
                <div className="card-body">
                <div className="input-group mb-4 mt-1 rounded" style={{ maxWidth: '500px' }}>
                        <span className="input-group-text"><i className="bi bi-search"></i></span>
                        <input
                            type="text"
                            placeholder="Search by company name or job role..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="form-control"
                            style={{ outline: 'none', boxShadow: 'none' }}

                        />
                    </div>
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col">Student id</th>
                                <th scope="col">Company name</th>
                                <th scope="col">Job role</th>
                                <th scope="col">Salary</th>
                                <th scope="col">Applied on</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSelected.map((selected, index) => (
                                <tr key={index}>
                                    <th scope="row">{index + 1}</th>
                                    <td>{selected?.companyName}</td>
                                    <td>{selected?.jobRole}</td>
                                    <td>{selected?.salary}</td>
                                    <td>{new Date(selected?.appliedOn).toString().slice(4, 21)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default AdminSelected;
