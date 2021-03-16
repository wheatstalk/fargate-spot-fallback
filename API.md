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

__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new FallbackPolicy(scope: Construct, id: string, props: FallbackPolicyProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[FallbackPolicyProps](#wheatstalk-fargate-spot-fallback-fallbackpolicyprops)</code>)  *No description*
  * **fallbackService** (<code>[IService](#aws-cdk-aws-ecs-iservice)</code>)  The fallback service on which to increase the desired count when the primary service can't provision tasks. 
  * **primaryService** (<code>[IService](#aws-cdk-aws-ecs-iservice)</code>)  The primary service on which to watch for capacity provisioning errors. 




## struct FallbackPolicyProps  <a id="wheatstalk-fargate-spot-fallback-fallbackpolicyprops"></a>


Props for `FallbackPolicy`.



Name | Type | Description 
-----|------|-------------
**fallbackService** | <code>[IService](#aws-cdk-aws-ecs-iservice)</code> | The fallback service on which to increase the desired count when the primary service can't provision tasks.
**primaryService** | <code>[IService](#aws-cdk-aws-ecs-iservice)</code> | The primary service on which to watch for capacity provisioning errors.



