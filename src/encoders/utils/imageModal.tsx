import React from 'react';
import Modal from 'react-modal';
import { ReactCompareSlider } from 'react-compare-slider';

const customStyles = {
    content: {
      maxHeight: '70%',
      maxwidth: '70%',
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
    },
  };

const FilePreviewModal  = ({ isOpen, onClose, originalFile, compressedFile, fileName }) => (
  <Modal isOpen={isOpen}
    style={customStyles}
    >
      <button onClick={onClose} className='closeButton'>
      &times;
      </button>

      <ReactCompareSlider
        id='compareContainer'
        itemOne={
          <img
            src={URL.createObjectURL(originalFile)}
            alt={`Original - ${fileName}`}
            style={{ 
                width: '100%',
                height: '100%',
                margin: 'auto',
                border: '2px solid red'
            }}
          />
        }
        itemTwo={
          <img
            src={URL.createObjectURL(new Blob([compressedFile]))}
            alt={`Compressed - ${fileName}`}
            style={{ 
                width: '100%',
                height: '100%',
                margin: 'auto',
                border: '2px solid green'
            }}
          />
        }
        style={{
            width: '90%',
            height: '90%',
            margin: 'auto',
            backgroundColor: 'transparent',
        }}
      />
  </Modal>
);

export default FilePreviewModal;
