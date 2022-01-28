# API Reference

**Classes**

Name|Description
----|-----------
[FallbackPolicy](#wheatstalk-fargate-spot-fallback-fallbackpolicy)|Add a fallback policy for fargate capacity provisioning errors.


**Structs**

Name|Description
----|-----------
[FallbackPolicyProps](#wheatstalk-fargate-spot-fallback-fallbackpolicyprops)|Props for `FallbackPolicy`.



## class FallbackPolicy  <a id="wheatstalk-fargate-spot-fallback-fallbackpolicy"></a>

Add a fallback policy for fargate capacity provisioning errors.

__Implements__: [IConstruct](#constructs-iconstruct), [IDependable](#constructs-idependable)
__Extends__: [Construct](#constructs-construct)

### Initializer




```ts
new FallbackPolicy(scope: Construct, id: string, props: FallbackPolicyProps)
```

* **scope** (<code>[Construct](#constructs-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[FallbackPolicyProps](#wheatstalk-fargate-spot-fallback-fallbackpolicyprops)</code>)  *No description*
  * **fallbackService** (<code>[aws_ecs.IService](#aws-cdk-lib-aws-ecs-iservice)</code>)  The fallback service on which to increase the desired count when the primary service can't provision tasks. 
  * **primaryService** (<code>[aws_ecs.IService](#aws-cdk-lib-aws-ecs-iservice)</code>)  The primary service on which to watch for capacity provisioning errors. 




## struct FallbackPolicyProps  <a id="wheatstalk-fargate-spot-fallback-fallbackpolicyprops"></a>


Props for `FallbackPolicy`.



Name | Type | Description 
-----|------|-------------
**fallbackService** | <code>[aws_ecs.IService](#aws-cdk-lib-aws-ecs-iservice)</code> | The fallback service on which to increase the desired count when the primary service can't provision tasks.
**primaryService** | <code>[aws_ecs.IService](#aws-cdk-lib-aws-ecs-iservice)</code> | The primary service on which to watch for capacity provisioning errors.



