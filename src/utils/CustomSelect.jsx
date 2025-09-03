import React from "react";
import { Select } from "antd";

const { Option } = Select;

const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  className = "w-[150px]",
}) => {
  return (
    <Select
      showSearch
       value={value ?? undefined} // <-- key change
      placeholder={placeholder}
      onChange={onChange}
      className={className}
      optionFilterProp="children"
      filterOption={(input, option) =>
        option?.children?.toLowerCase().includes(input.toLowerCase())
      }
      dropdownClassName="!bg-white !rounded-md !shadow-lg custom-dropdown"
    >
      {options.map((opt, index) => (
        <Option key={index} value={opt} className="!text-gray-800">
          {opt}
        </Option>
      ))}
    </Select>
  );
};

export default CustomSelect;





// import React from "react";
// import { Select } from "antd";

// const { Option } = Select;

// const CustomSelect = ({
//   options = [],
//   value,
//   onChange,
//   onFocus,
//   onSearch,
//   placeholder = "Select...",
//   className = "w-[150px]",
//   showSearch = false,
//   disabled = false,
//   dropdownRender,
// }) => {
//   return (
//     <Select
//       showSearch={showSearch}
//       value={value ?? undefined}
//       placeholder={placeholder}
//       onChange={onChange}
//       onFocus={onFocus}
//       onSearch={onSearch}
//       className={className}
//       disabled={disabled}
//       optionFilterProp="children"
//       filterOption={(input, option) =>
//         option?.children?.toLowerCase().includes(input.toLowerCase())
//       }
//       dropdownRender={dropdownRender}
//       dropdownClassName="!bg-white !rounded-md !shadow-lg custom-dropdown"
//     >
//       {options.map((opt, index) => (
//         <Option key={index} value={opt} className="!text-gray-800">
//           {opt}
//         </Option>
//       ))}
//     </Select>
//   );
// };

// export default CustomSelect;
