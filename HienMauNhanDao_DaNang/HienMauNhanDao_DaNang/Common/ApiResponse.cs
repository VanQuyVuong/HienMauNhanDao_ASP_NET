namespace HienMauNhanDao_DaNang.Common
{
    public class ApiResponse<T>
    {

        public bool Success { get; set; }
        public string Message { get; set; }
        public T? Data { get; set; }


        //Tao Reponse thanh cong co Data
        public static ApiResponse<T> Ok(T data, string message = "ThanhCong")
        {
            return new ApiResponse<T>
            {
                Success = true,
                Message= message,
                Data= data
            };

        }


        //Tao Reponse thanh cong khong co Data
        public static ApiResponse<T> Ok(string message="Thanh Cong")
        {
            return new ApiResponse<T>
            {
                Success = true,
                Message = message
            };
        }

        //Tao Reponse that bai
        public static ApiResponse<T> Fail(string message="Co Loi Xay ra")
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message
            };
        }


    }
}
