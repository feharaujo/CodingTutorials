import { Handler } from "aws-cdk-lib/aws-lambda";

export const handler: Handler = async (event: any) => {
    console.log('Saving event for analytics', JSON.stringify(event));
  
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 1000));
  
    return {
      status: 'PROCESSED',
      ...event
    };
  };