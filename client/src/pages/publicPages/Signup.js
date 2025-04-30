import React, {useState} from "react"


const JobSeekerSignup = () =>{
  return <h1>Job Seeker Signup</h1>
}

const RecruiterSignup = () =>{
  return <h1>Recruiter Signup</h1>
}

const Signup = () => {
  const [accountType, setAccountType] = useState("job-seeker");

  
  return (
    <div>
      <h1>Signup</h1>
      {accountType === 'job-seeker' ? <JobSeekerSignup /> : <RecruiterSignup />}
    </div>
  )
}

export default Signup