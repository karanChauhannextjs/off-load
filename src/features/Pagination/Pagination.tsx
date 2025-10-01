import React, {useState} from "react";
import {PaginationProps} from "@features/Pagination/Pagination.types.ts";
import './Pagination.scss'

const Pagination:React.FC<PaginationProps> = (props) => {
  const { totalItems, itemsPerPage, onPageChange } = props
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange(page);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`page-item ${i === currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className='pagination'>
      <button
        className="page-item"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <i className={'icon-left-arrow'}/>
      </button>
      {renderPageNumbers()}
      <button
        className="page-item"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <i className={'icon-right-arrow'}/>
      </button>
    </div>
  );
};

export default Pagination;